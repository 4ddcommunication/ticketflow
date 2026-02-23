<?php

namespace Ticketflow\API;

use Ticketflow\Models\Reply;
use Ticketflow\Models\Ticket;
use Ticketflow\Models\Attachment;
use Ticketflow\Services\ActivityService;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined('ABSPATH') || exit;

class RepliesController extends BaseController
{
    public function __construct(
        private ActivityService $activity
    ) {}

    public function register_routes(): void
    {
        register_rest_route($this->namespace, '/tickets/(?P<ticket_id>\d+)/replies', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'list_replies'],
                'permission_callback' => [$this, 'check_auth'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'create_reply'],
                'permission_callback' => function () {
                    return $this->check_auth(new WP_REST_Request()) === true
                        && $this->check_cap('ticketflow_reply_tickets') === true;
                },
            ],
        ]);

        register_rest_route($this->namespace, '/replies/(?P<id>\d+)', [
            [
                'methods'             => 'PATCH',
                'callback'            => [$this, 'update_reply'],
                'permission_callback' => [$this, 'check_auth'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'delete_reply'],
                'permission_callback' => [$this, 'check_auth'],
            ],
        ]);
    }

    public function list_replies(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $ticket = Ticket::find((int) $request['ticket_id']);
        if (!$ticket) {
            return $this->error('not_found', __('Ticket not found.', 'ticketflow'), 404);
        }

        if (!$this->is_agent_or_admin() && (int) $ticket->client_id !== get_current_user_id()) {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }

        $include_internal = $this->is_agent_or_admin();
        $replies = Reply::get_by_ticket($ticket->id, $include_internal);

        $formatted = array_map(function ($reply) {
            return $this->format_reply($reply);
        }, $replies);

        return $this->success($formatted);
    }

    public function create_reply(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $ticket = Ticket::find((int) $request['ticket_id']);
        if (!$ticket) {
            return $this->error('not_found', __('Ticket not found.', 'ticketflow'), 404);
        }

        if (!$this->is_agent_or_admin() && (int) $ticket->client_id !== get_current_user_id()) {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }

        $body = $request->get_param('body');
        if (empty($body)) {
            return $this->error('missing_body', __('Reply body is required.', 'ticketflow'), 400);
        }

        $is_internal = (bool) $request->get_param('is_internal');
        if ($is_internal && !$this->is_agent_or_admin()) {
            $is_internal = false;
        }

        $reply_type = $is_internal ? 'note' : 'reply';

        $id = Reply::create([
            'ticket_id'   => $ticket->id,
            'author_id'   => get_current_user_id(),
            'body'        => wp_kses_post($body),
            'is_internal' => $is_internal ? 1 : 0,
            'reply_type'  => sanitize_text_field($reply_type),
        ]);

        if (!$id) {
            return $this->error('create_failed', __('Failed to create reply.', 'ticketflow'), 500);
        }

        // Update ticket updated_at
        Ticket::update($ticket->id, []);

        $this->activity->log($ticket->id, $is_internal ? 'internal_note_added' : 'reply_added');

        if (!$is_internal) {
            do_action('ticketflow_reply_added', $ticket->id, $id, get_current_user_id());
        }

        $reply = Reply::find($id);
        return $this->success($this->format_reply($reply), 201);
    }

    public function update_reply(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $reply = Reply::find((int) $request['id']);
        if (!$reply) {
            return $this->error('not_found', __('Reply not found.', 'ticketflow'), 404);
        }

        // Only author or admin can edit
        if ((int) $reply->author_id !== get_current_user_id() && $this->get_role() !== 'admin') {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }

        $body = $request->get_param('body');
        if (empty($body)) {
            return $this->error('missing_body', __('Reply body is required.', 'ticketflow'), 400);
        }

        Reply::update($reply->id, ['body' => wp_kses_post($body)]);

        $reply = Reply::find($reply->id);
        return $this->success($this->format_reply($reply));
    }

    public function delete_reply(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $reply = Reply::find((int) $request['id']);
        if (!$reply) {
            return $this->error('not_found', __('Reply not found.', 'ticketflow'), 404);
        }

        if ((int) $reply->author_id !== get_current_user_id() && $this->get_role() !== 'admin') {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }

        Reply::delete($reply->id);
        return $this->success(null, 204);
    }

    private function format_reply(object $reply): array
    {
        $author = get_userdata($reply->author_id);
        $attachments = Attachment::get_by_reply($reply->id);

        return [
            'id'          => (int) $reply->id,
            'ticket_id'   => (int) $reply->ticket_id,
            'author'      => $author ? [
                'id'   => (int) $author->ID,
                'name' => $author->display_name,
                'role' => (new \Ticketflow\Services\AuthService())->get_ticketflow_role($author),
            ] : null,
            'body'        => $reply->body,
            'is_internal' => (bool) $reply->is_internal,
            'reply_type'  => $reply->reply_type,
            'attachments' => array_map(function ($att) {
                return [
                    'id'        => (int) $att->id,
                    'file_name' => $att->file_name,
                    'file_size' => (int) $att->file_size,
                    'mime_type' => $att->mime_type,
                    'download_url' => rest_url("ticketflow/v1/attachments/{$att->id}/download"),
                ];
            }, $attachments),
            'created_at'  => $reply->created_at,
            'updated_at'  => $reply->updated_at,
        ];
    }
}
