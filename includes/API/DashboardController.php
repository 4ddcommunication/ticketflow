<?php

namespace Ticketflow\API;

use Ticketflow\Models\Ticket;
use Ticketflow\Services\TicketService;
use Ticketflow\Services\ActivityService;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined('ABSPATH') || exit;

class DashboardController extends BaseController
{
    public function register_routes(): void
    {
        register_rest_route($this->namespace, '/dashboard/stats', [
            'methods'             => 'GET',
            'callback'            => [$this, 'stats'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        register_rest_route($this->namespace, '/dashboard/my-queue', [
            'methods'             => 'GET',
            'callback'            => [$this, 'my_queue'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
    }

    public function stats(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $status_counts = Ticket::count_by_status();

        $total = array_sum($status_counts);
        $open  = ($status_counts['open'] ?? 0) + ($status_counts['in_progress'] ?? 0) + ($status_counts['waiting'] ?? 0);

        $data = [
            'total'     => $total,
            'open'      => $open,
            'by_status' => $status_counts,
        ];

        // Agent-specific stats
        if ($this->is_agent_or_admin()) {
            $my_queue = Ticket::query([
                'agent_id' => get_current_user_id(),
                'status'   => 'open',
                'per_page' => 1,
            ]);
            $data['my_open'] = $my_queue['total'];

            $unassigned = Ticket::query([
                'agent_id' => 0,
                'per_page' => 1,
            ]);
            $data['unassigned'] = $unassigned['total'];
        } else {
            // Client stats
            $my_tickets = Ticket::query([
                'client_id' => get_current_user_id(),
                'per_page'  => 1,
            ]);
            $data['my_total'] = $my_tickets['total'];
        }

        return $this->success($data);
    }

    public function my_queue(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $service = new TicketService(new ActivityService());

        $args = $this->get_pagination_args($request);

        if ($this->is_agent_or_admin()) {
            $args['agent_id'] = get_current_user_id();
        } else {
            $args['client_id'] = get_current_user_id();
        }

        $status = $request->get_param('status');
        if ($status) {
            $args['status'] = sanitize_text_field($status);
        }

        $result = Ticket::query($args);
        $result['items'] = array_map([$service, 'format'], $result['items']);

        return $this->paginated($result);
    }
}
