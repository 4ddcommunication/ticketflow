<?php

namespace Ticketflow\Services;

use Ticketflow\Models\Ticket;
use Ticketflow\Models\Reply;
use WP_Error;

defined('ABSPATH') || exit;

class TicketService
{
    public function __construct(
        private ActivityService $activity
    ) {}

    public function create(array $data): int|WP_Error
    {
        $required = ['subject', 'description', 'client_id'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return new WP_Error('missing_field', sprintf(__('Field "%s" is required.', 'ticketflow'), $field), ['status' => 400]);
            }
        }

        $insert = [
            'subject'     => sanitize_text_field($data['subject']),
            'description' => wp_kses_post($data['description']),
            'status'      => 'open',
            'priority'    => sanitize_text_field($data['priority'] ?? 'normal'),
            'category'    => isset($data['category']) ? sanitize_text_field($data['category']) : null,
            'client_id'   => (int) $data['client_id'],
            'agent_id'    => !empty($data['agent_id']) ? (int) $data['agent_id'] : null,
        ];

        // Calculate SLA deadline
        $settings = get_option('ticketflow_settings', []);
        $sla_hours = $settings['sla_resolve_hours'] ?? 72;
        $insert['sla_deadline'] = gmdate('Y-m-d H:i:s', time() + ($sla_hours * 3600));

        $id = Ticket::create($insert);
        if (!$id) {
            return new WP_Error('create_failed', __('Failed to create ticket.', 'ticketflow'), ['status' => 500]);
        }

        $this->activity->log($id, 'ticket_created');

        /**
         * Fires after a ticket is created.
         *
         * @param int   $id   Ticket ID.
         * @param array $data Ticket data.
         */
        do_action('ticketflow_ticket_created', $id, $insert);

        return $id;
    }

    public function update(int $id, array $data): true|WP_Error
    {
        $ticket = Ticket::find($id);
        if (!$ticket) {
            return new WP_Error('not_found', __('Ticket not found.', 'ticketflow'), ['status' => 404]);
        }

        $update = [];
        $changes = [];

        if (isset($data['subject'])) {
            $update['subject'] = sanitize_text_field($data['subject']);
        }
        if (isset($data['status']) && $data['status'] !== $ticket->status) {
            $update['status'] = sanitize_text_field($data['status']);
            $changes[] = ['field' => 'status', 'old' => $ticket->status, 'new' => $data['status']];
            if ($data['status'] === 'closed') {
                $update['closed_at'] = current_time('mysql', true);
            }
        }
        if (isset($data['priority']) && $data['priority'] !== $ticket->priority) {
            $update['priority'] = sanitize_text_field($data['priority']);
            $changes[] = ['field' => 'priority', 'old' => $ticket->priority, 'new' => $data['priority']];
        }
        if (isset($data['category'])) {
            $update['category'] = sanitize_text_field($data['category']);
        }
        if (isset($data['agent_id'])) {
            $update['agent_id'] = (int) $data['agent_id'] ?: null;
            if ($data['agent_id'] != $ticket->agent_id) {
                $changes[] = ['field' => 'agent', 'old' => $ticket->agent_id, 'new' => $data['agent_id']];
            }
        }

        if (empty($update)) {
            return true;
        }

        if (!Ticket::update($id, $update)) {
            return new WP_Error('update_failed', __('Failed to update ticket.', 'ticketflow'), ['status' => 500]);
        }

        foreach ($changes as $change) {
            $this->activity->log($id, $change['field'] . '_changed', [
                'old_value' => (string) $change['old'],
                'new_value' => (string) $change['new'],
            ]);

            if ($change['field'] === 'status') {
                do_action('ticketflow_ticket_status_changed', $id, $change['old'], $change['new']);
                if ($change['new'] === 'closed') {
                    do_action('ticketflow_ticket_closed', $id);
                }
            }
            if ($change['field'] === 'agent') {
                do_action('ticketflow_ticket_assigned', $id, (int) $change['new']);
            }
        }

        return true;
    }

    public function assign(int $id, int $agent_id): true|WP_Error
    {
        return $this->update($id, ['agent_id' => $agent_id]);
    }

    public function close(int $id): true|WP_Error
    {
        return $this->update($id, ['status' => 'closed']);
    }

    public function reopen(int $id): true|WP_Error
    {
        return $this->update($id, ['status' => 'open']);
    }

    public function format(object $ticket): array
    {
        $client = get_userdata($ticket->client_id);
        $agent  = $ticket->agent_id ? get_userdata($ticket->agent_id) : null;

        return [
            'id'           => (int) $ticket->id,
            'ticket_uid'   => $ticket->ticket_uid,
            'subject'      => $ticket->subject,
            'description'  => $ticket->description,
            'status'       => $ticket->status,
            'priority'     => $ticket->priority,
            'category'     => $ticket->category,
            'client'       => $client ? [
                'id'      => (int) $client->ID,
                'name'    => $client->display_name,
                'email'   => $client->user_email,
                'company' => get_user_meta($client->ID, 'ticketflow_company', true) ?: '',
            ] : null,
            'agent'        => $agent ? [
                'id'   => (int) $agent->ID,
                'name' => $agent->display_name,
            ] : null,
            'sla_deadline' => $ticket->sla_deadline,
            'reply_count'  => Reply::count_by_ticket($ticket->id),
            'created_at'   => $ticket->created_at,
            'updated_at'   => $ticket->updated_at,
            'closed_at'    => $ticket->closed_at,
        ];
    }

    public function auto_close_stale_tickets(): void
    {
        $settings = get_option('ticketflow_settings', []);
        $days     = $settings['auto_close_days'] ?? 7;
        if ($days <= 0) {
            return;
        }

        global $wpdb;
        $table    = \Ticketflow\Database\Schema::table('tickets');
        $cutoff   = gmdate('Y-m-d H:i:s', time() - ($days * 86400));

        $stale = $wpdb->get_col($wpdb->prepare(
            "SELECT id FROM %i WHERE status = 'resolved' AND updated_at < %s",
            $table,
            $cutoff
        ));

        foreach ($stale as $ticket_id) {
            $this->close((int) $ticket_id);
        }
    }
}
