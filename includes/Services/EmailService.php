<?php

namespace Ticketflow\Services;

use Ticketflow\Email\EmailManager;
use Ticketflow\Models\Ticket;

defined('ABSPATH') || exit;

class EmailService
{
    private EmailManager $mailer;

    public function __construct()
    {
        $this->mailer = new EmailManager();
    }

    public function register_hooks(): void
    {
        $settings = get_option('ticketflow_settings', []);
        if (empty($settings['email_notifications'])) {
            return;
        }

        add_action('ticketflow_ticket_created', [$this, 'on_ticket_created'], 10, 2);
        add_action('ticketflow_reply_added', [$this, 'on_reply_added'], 10, 3);
        add_action('ticketflow_internal_note_added', [$this, 'on_internal_note'], 10, 3);
        add_action('ticketflow_ticket_assigned', [$this, 'on_ticket_assigned'], 10, 2);
        add_action('ticketflow_ticket_status_changed', [$this, 'on_status_changed'], 10, 3);
        add_action('ticketflow_ticket_closed', [$this, 'on_ticket_closed'], 10, 1);
        add_action('ticketflow_magic_link_requested', [$this, 'on_magic_link'], 10, 2);
    }

    public function on_ticket_created(int $ticket_id, array $data): void
    {
        $ticket = Ticket::find($ticket_id);
        if (!$ticket) return;

        $client = get_userdata($ticket->client_id);
        if (!$client) return;

        $portal_url = $this->get_portal_url();
        $company = get_user_meta($ticket->client_id, 'ticketflow_company', true) ?: '';
        $client_label = $company ? $client->display_name . ' (' . $company . ')' : $client->display_name;

        // Notify client
        $this->mailer->send(
            $client->user_email,
            sprintf('[%s] Ticket erstellt: %s', $ticket->ticket_uid, $ticket->subject),
            'ticket-created',
            [
                'client_name' => $client->display_name,
                'ticket_uid'  => $ticket->ticket_uid,
                'subject'     => $ticket->subject,
                'description' => wp_trim_words($ticket->description, 50),
                'portal_url'  => $portal_url,
            ]
        );

        // Notify all admins
        $admins = get_users(['role__in' => ['administrator', 'ticketflow_admin', 'ticketflow_agent']]);
        foreach ($admins as $admin) {
            if ((int) $admin->ID === (int) $ticket->client_id) continue;
            $this->mailer->send(
                $admin->user_email,
                sprintf('[%s] Neues Ticket: %s', $ticket->ticket_uid, $ticket->subject),
                'ticket-new-admin',
                [
                    'agent_name'  => $admin->display_name,
                    'client_name' => $client_label,
                    'ticket_uid'  => $ticket->ticket_uid,
                    'subject'     => $ticket->subject,
                    'description' => wp_trim_words(wp_strip_all_tags($ticket->description), 50),
                    'priority'    => $this->translate_priority($ticket->priority),
                    'admin_url'   => $this->get_dashboard_url($ticket->id),
                ]
            );
        }
    }

    public function on_reply_added(int $ticket_id, int $reply_id, int $author_id): void
    {
        $ticket = Ticket::find($ticket_id);
        if (!$ticket) return;

        $reply  = \Ticketflow\Models\Reply::find($reply_id);
        if (!$reply || $reply->is_internal) return;

        $author  = get_userdata($author_id);
        $client  = get_userdata($ticket->client_id);
        $agent   = $ticket->agent_id ? get_userdata($ticket->agent_id) : null;
        $company = get_user_meta($ticket->client_id, 'ticketflow_company', true) ?: '';
        $client_label = $company ? $client->display_name . ' (' . $company . ')' : $client->display_name;

        $portal_url = $this->get_portal_url();

        if ($author_id == $ticket->client_id) {
            // Client replied → notify all admins/agents
            $staff = get_users(['role__in' => ['administrator', 'ticketflow_admin', 'ticketflow_agent']]);
            foreach ($staff as $member) {
                $this->mailer->send(
                    $member->user_email,
                    sprintf('[%s] Neue Antwort: %s', $ticket->ticket_uid, $ticket->subject),
                    'reply-added',
                    [
                        'recipient_name' => $member->display_name,
                        'author_name'    => $client_label,
                        'ticket_uid'     => $ticket->ticket_uid,
                        'subject'        => $ticket->subject,
                        'reply_preview'  => wp_trim_words(wp_strip_all_tags($reply->body), 50),
                        'view_url'       => $this->get_dashboard_url($ticket->id),
                    ]
                );
            }
        } elseif ($client) {
            // Agent replied → notify client
            $this->mailer->send(
                $client->user_email,
                sprintf(__('[%s] New Reply: %s', 'ticketflow'), $ticket->ticket_uid, $ticket->subject),
                'reply-added',
                [
                    'recipient_name' => $client->display_name,
                    'author_name'    => $author ? $author->display_name : __('Support', 'ticketflow'),
                    'ticket_uid'     => $ticket->ticket_uid,
                    'subject'        => $ticket->subject,
                    'reply_preview'  => wp_trim_words(wp_strip_all_tags($reply->body), 50),
                    'view_url'       => $portal_url,
                ]
            );
        }
    }

    public function on_internal_note(int $ticket_id, int $reply_id, int $author_id): void
    {
        $ticket = Ticket::find($ticket_id);
        if (!$ticket) return;

        $reply = \Ticketflow\Models\Reply::find($reply_id);
        if (!$reply) return;

        $author = get_userdata($author_id);

        $staff = get_users(['role__in' => ['administrator', 'ticketflow_admin', 'ticketflow_agent']]);
        foreach ($staff as $member) {
            if ((int) $member->ID === $author_id) continue;
            $this->mailer->send(
                $member->user_email,
                sprintf('[%s] Interne Notiz: %s', $ticket->ticket_uid, $ticket->subject),
                'internal-note',
                [
                    'recipient_name' => $member->display_name,
                    'author_name'    => $author ? $author->display_name : 'System',
                    'ticket_uid'     => $ticket->ticket_uid,
                    'subject'        => $ticket->subject,
                    'note_preview'   => wp_trim_words(wp_strip_all_tags($reply->body), 50),
                    'view_url'       => $this->get_dashboard_url($ticket->id),
                ]
            );
        }
    }

    public function on_ticket_assigned(int $ticket_id, int $agent_id): void
    {
        $ticket = Ticket::find($ticket_id);
        if (!$ticket) return;

        $agent  = get_userdata($agent_id);
        $client = get_userdata($ticket->client_id);
        if (!$agent) return;

        $company = get_user_meta($ticket->client_id, 'ticketflow_company', true) ?: '';
        $client_label = $client ? ($company ? $client->display_name . ' (' . $company . ')' : $client->display_name) : __('Unknown', 'ticketflow');

        $this->mailer->send(
            $agent->user_email,
            sprintf('[%s] Ticket zugewiesen: %s', $ticket->ticket_uid, $ticket->subject),
            'ticket-assigned',
            [
                'agent_name'  => $agent->display_name,
                'client_name' => $client_label,
                'ticket_uid'  => $ticket->ticket_uid,
                'subject'     => $ticket->subject,
                'priority'    => $this->translate_priority($ticket->priority),
                'admin_url'   => $this->get_dashboard_url($ticket->id),
            ]
        );
    }

    public function on_status_changed(int $ticket_id, string $old_status, string $new_status): void
    {
        $ticket = Ticket::find($ticket_id);
        if (!$ticket) return;

        $client = get_userdata($ticket->client_id);
        if (!$client) return;

        $portal_url = $this->get_portal_url();

        $this->mailer->send(
            $client->user_email,
            sprintf('[%s] Status aktualisiert: %s', $ticket->ticket_uid, $ticket->subject),
            'status-changed',
            [
                'client_name' => $client->display_name,
                'ticket_uid'  => $ticket->ticket_uid,
                'subject'     => $ticket->subject,
                'old_status'  => $this->translate_status($old_status),
                'new_status'  => $this->translate_status($new_status),
                'portal_url'  => $portal_url,
            ]
        );
    }

    public function on_ticket_closed(int $ticket_id): void
    {
        $ticket = Ticket::find($ticket_id);
        if (!$ticket) return;

        $client = get_userdata($ticket->client_id);
        if (!$client) return;

        $portal_url = $this->get_portal_url();

        $this->mailer->send(
            $client->user_email,
            sprintf('[%s] Ticket geschlossen: %s', $ticket->ticket_uid, $ticket->subject),
            'ticket-closed',
            [
                'client_name' => $client->display_name,
                'ticket_uid'  => $ticket->ticket_uid,
                'subject'     => $ticket->subject,
                'portal_url'  => $portal_url,
            ]
        );
    }

    public function on_magic_link(\WP_User $user, string $magic_url): void
    {
        $this->mailer->send(
            $user->user_email,
            'Dein Login-Link',
            'magic-link',
            [
                'client_name' => $user->display_name,
                'magic_url'   => $magic_url,
            ]
        );
    }

    private function get_portal_url(): string
    {
        $page_id = get_option('ticketflow_portal_page_id');
        return $page_id ? get_permalink($page_id) : home_url();
    }

    private function translate_priority(string $priority): array
    {
        $map = [
            'low'    => ['label' => 'Niedrig',  'color' => '#6b7280', 'bg' => '#f3f4f6'],
            'normal' => ['label' => 'Normal',   'color' => '#2563eb', 'bg' => '#eff6ff'],
            'high'   => ['label' => 'Hoch',     'color' => '#ea580c', 'bg' => '#fff7ed'],
            'urgent' => ['label' => 'Dringend', 'color' => '#dc2626', 'bg' => '#fef2f2'],
        ];
        return $map[$priority] ?? ['label' => ucfirst($priority), 'color' => '#6b7280', 'bg' => '#f3f4f6'];
    }

    private function translate_status(string $status): string
    {
        $map = [
            'open'        => 'Offen',
            'in_progress' => 'In Bearbeitung',
            'waiting'     => 'Wartend',
            'resolved'    => 'Gelöst',
            'closed'      => 'Geschlossen',
        ];
        return $map[$status] ?? ucfirst(str_replace('_', ' ', $status));
    }

    private function get_dashboard_url(int $ticket_id): string
    {
        $page_id = get_option('ticketflow_dashboard_page_id');
        $base = $page_id ? get_permalink($page_id) : admin_url('admin.php?page=ticketflow');
        return $base . '#/tickets/' . $ticket_id;
    }
}
