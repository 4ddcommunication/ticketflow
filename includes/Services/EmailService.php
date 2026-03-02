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

        // Notify client
        $this->mailer->send(
            $client->user_email,
            sprintf(__('[%s] Ticket Created: %s', 'ticketflow'), $ticket->ticket_uid, $ticket->subject),
            'ticket-created',
            [
                'client_name' => $client->display_name,
                'ticket_uid'  => $ticket->ticket_uid,
                'subject'     => $ticket->subject,
                'description' => wp_trim_words($ticket->description, 50),
                'portal_url'  => $portal_url,
            ]
        );

        // Notify assigned agent
        if ($ticket->agent_id) {
            $agent = get_userdata($ticket->agent_id);
            if ($agent) {
                $this->mailer->send(
                    $agent->user_email,
                    sprintf(__('[%s] New Ticket Assigned: %s', 'ticketflow'), $ticket->ticket_uid, $ticket->subject),
                    'ticket-assigned',
                    [
                        'agent_name'  => $agent->display_name,
                        'client_name' => $client->display_name,
                        'ticket_uid'  => $ticket->ticket_uid,
                        'subject'     => $ticket->subject,
                        'admin_url'   => admin_url('admin.php?page=ticketflow#/tickets/' . $ticket->id),
                    ]
                );
            }
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

        $portal_url = $this->get_portal_url();

        // Notify the other party
        if ($author_id == $ticket->client_id && $agent) {
            // Client replied → notify agent
            $this->mailer->send(
                $agent->user_email,
                sprintf(__('[%s] New Reply: %s', 'ticketflow'), $ticket->ticket_uid, $ticket->subject),
                'reply-added',
                [
                    'recipient_name' => $agent->display_name,
                    'author_name'    => $author->display_name,
                    'ticket_uid'     => $ticket->ticket_uid,
                    'subject'        => $ticket->subject,
                    'reply_preview'  => wp_trim_words(wp_strip_all_tags($reply->body), 50),
                    'view_url'       => admin_url('admin.php?page=ticketflow#/tickets/' . $ticket->id),
                ]
            );
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

    public function on_ticket_assigned(int $ticket_id, int $agent_id): void
    {
        $ticket = Ticket::find($ticket_id);
        if (!$ticket) return;

        $agent  = get_userdata($agent_id);
        $client = get_userdata($ticket->client_id);
        if (!$agent) return;

        $this->mailer->send(
            $agent->user_email,
            sprintf(__('[%s] Ticket Assigned to You: %s', 'ticketflow'), $ticket->ticket_uid, $ticket->subject),
            'ticket-assigned',
            [
                'agent_name'  => $agent->display_name,
                'client_name' => $client ? $client->display_name : __('Unknown', 'ticketflow'),
                'ticket_uid'  => $ticket->ticket_uid,
                'subject'     => $ticket->subject,
                'admin_url'   => admin_url('admin.php?page=ticketflow#/tickets/' . $ticket->id),
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
            sprintf(__('[%s] Status Updated: %s', 'ticketflow'), $ticket->ticket_uid, $ticket->subject),
            'status-changed',
            [
                'client_name' => $client->display_name,
                'ticket_uid'  => $ticket->ticket_uid,
                'subject'     => $ticket->subject,
                'old_status'  => ucfirst(str_replace('_', ' ', $old_status)),
                'new_status'  => ucfirst(str_replace('_', ' ', $new_status)),
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
            sprintf(__('[%s] Ticket Closed: %s', 'ticketflow'), $ticket->ticket_uid, $ticket->subject),
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
            __('Your Login Link', 'ticketflow'),
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
}
