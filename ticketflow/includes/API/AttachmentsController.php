<?php

namespace Ticketflow\API;

use Ticketflow\Models\Attachment;
use Ticketflow\Models\Ticket;
use Ticketflow\Services\AttachmentService;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined('ABSPATH') || exit;

class AttachmentsController extends BaseController
{
    public function __construct(
        private AttachmentService $service
    ) {
        parent::__construct();
    }

    public function register_routes(): void
    {
        register_rest_route($this->namespace, '/tickets/(?P<ticket_id>\d+)/attachments', [
            'methods'             => 'POST',
            'callback'            => [$this, 'upload'],
            'permission_callback' => function () {
                return $this->check_auth(new WP_REST_Request()) === true
                    && $this->check_cap('ticketflow_upload_files') === true;
            },
        ]);

        register_rest_route($this->namespace, '/attachments/(?P<id>\d+)/download', [
            'methods'             => 'GET',
            'callback'            => [$this, 'download'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        register_rest_route($this->namespace, '/attachments/(?P<id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [$this, 'delete_attachment'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
    }

    public function upload(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $ticket = Ticket::find((int) $request['ticket_id']);
        if (!$ticket) {
            return $this->error('not_found', __('Ticket not found.', 'ticketflow'), 404);
        }

        if (!$this->is_agent_or_admin() && (int) $ticket->client_id !== get_current_user_id()) {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }

        $files = $request->get_file_params();
        if (empty($files['file'])) {
            return $this->error('no_file', __('No file uploaded.', 'ticketflow'), 400);
        }

        $reply_id = $request->get_param('reply_id') ? (int) $request->get_param('reply_id') : null;

        $result = $this->service->upload($ticket->id, $files['file'], $reply_id);
        if (is_wp_error($result)) {
            return $result;
        }

        $attachment = Attachment::find($result);
        return $this->success($this->service->format($attachment), 201);
    }

    public function download(WP_REST_Request $request): void
    {
        $attachment = Attachment::find((int) $request['id']);
        if (!$attachment) {
            wp_die(__('Attachment not found.', 'ticketflow'), 404);
        }

        // Check access
        $ticket = Ticket::find($attachment->ticket_id);
        if (!$ticket) {
            wp_die(__('Ticket not found.', 'ticketflow'), 404);
        }

        if (!$this->is_agent_or_admin() && (int) $ticket->client_id !== get_current_user_id()) {
            wp_die(__('Access denied.', 'ticketflow'), 403);
        }

        $path = $this->service->get_file_path($attachment);
        if (!file_exists($path)) {
            wp_die(__('File not found.', 'ticketflow'), 404);
        }

        header('Content-Type: ' . $attachment->mime_type);
        header('Content-Disposition: attachment; filename="' . $attachment->file_name . '"');
        header('Content-Length: ' . filesize($path));
        header('Cache-Control: private, max-age=3600');

        readfile($path);
        exit;
    }

    public function delete_attachment(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $attachment = Attachment::find((int) $request['id']);
        if (!$attachment) {
            return $this->error('not_found', __('Attachment not found.', 'ticketflow'), 404);
        }

        // Only uploader or admin can delete
        if ((int) $attachment->uploaded_by !== get_current_user_id() && $this->get_role() !== 'admin') {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }

        $this->service->delete_file($attachment);
        return $this->success(null, 204);
    }
}
