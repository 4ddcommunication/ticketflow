<?php

namespace Ticketflow\API;

use Ticketflow\Models\Ticket;
use Ticketflow\Services\ActivityService;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined('ABSPATH') || exit;

class ActivityController extends BaseController
{
    public function register_routes(): void
    {
        register_rest_route($this->namespace, '/tickets/(?P<ticket_id>\d+)/activity', [
            'methods'             => 'GET',
            'callback'            => [$this, 'list_activity'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
    }

    public function list_activity(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $ticket = Ticket::find((int) $request['ticket_id']);
        if (!$ticket) {
            return $this->error('not_found', __('Ticket not found.', 'ticketflow'), 404);
        }

        if (!$this->is_agent_or_admin() && (int) $ticket->client_id !== get_current_user_id()) {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }

        $service  = new ActivityService();
        $activity = $service->get_ticket_activity($ticket->id);

        return $this->success($activity);
    }
}
