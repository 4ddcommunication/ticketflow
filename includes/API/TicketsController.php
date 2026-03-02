<?php

namespace Ticketflow\API;

use Ticketflow\Models\Ticket;
use Ticketflow\Services\TicketService;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined('ABSPATH') || exit;

class TicketsController extends BaseController
{
    public function __construct(
        private TicketService $service
    ) {
        parent::__construct();
    }

    public function register_routes(): void
    {
        register_rest_route($this->namespace, '/tickets', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'list_tickets'],
                'permission_callback' => [$this, 'check_auth'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'create_ticket'],
                'permission_callback' => function () {
                    return $this->check_auth(new WP_REST_Request()) === true
                        && $this->check_cap('ticketflow_create_tickets') === true;
                },
            ],
        ]);

        register_rest_route($this->namespace, '/tickets/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_ticket'],
                'permission_callback' => [$this, 'check_auth'],
            ],
            [
                'methods'             => 'PATCH',
                'callback'            => [$this, 'update_ticket'],
                'permission_callback' => [$this, 'check_auth'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'delete_ticket'],
                'permission_callback' => function () {
                    return $this->check_auth(new WP_REST_Request()) === true
                        && $this->check_cap('ticketflow_delete_tickets') === true;
                },
            ],
        ]);

        register_rest_route($this->namespace, '/tickets/(?P<id>\d+)/assign', [
            'methods'             => 'POST',
            'callback'            => [$this, 'assign_ticket'],
            'permission_callback' => function () {
                return $this->check_auth(new WP_REST_Request()) === true
                    && $this->check_cap('ticketflow_assign_tickets') === true;
            },
        ]);

        register_rest_route($this->namespace, '/tickets/(?P<id>\d+)/close', [
            'methods'             => 'POST',
            'callback'            => [$this, 'close_ticket'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        register_rest_route($this->namespace, '/tickets/(?P<id>\d+)/reopen', [
            'methods'             => 'POST',
            'callback'            => [$this, 'reopen_ticket'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
    }

    public function list_tickets(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $args = $this->get_pagination_args($request);

        // Clients can only see their own tickets
        if (!$this->is_agent_or_admin()) {
            $args['client_id'] = get_current_user_id();
        } else {
            if ($request->get_param('client_id')) {
                $args['client_id'] = (int) $request->get_param('client_id');
            }
            if ($request->get_param('agent_id')) {
                $args['agent_id'] = (int) $request->get_param('agent_id');
            }
        }

        foreach (['status', 'priority', 'category', 'search', 'orderby', 'order'] as $param) {
            $val = $request->get_param($param);
            if ($val !== null) {
                $args[$param] = sanitize_text_field($val);
            }
        }

        $result = Ticket::query($args);
        $result['items'] = array_map([$this->service, 'format'], $result['items']);

        return $this->paginated($result);
    }

    public function get_ticket(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $ticket = Ticket::find((int) $request['id']);
        if (!$ticket) {
            return $this->error('not_found', __('Ticket not found.', 'ticketflow'), 404);
        }

        // Clients can only view their own tickets
        if (!$this->is_agent_or_admin() && (int) $ticket->client_id !== get_current_user_id()) {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }

        return $this->success($this->service->format($ticket));
    }

    public function create_ticket(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $data = [
            'subject'     => $request->get_param('subject'),
            'description' => $request->get_param('description'),
            'priority'    => $request->get_param('priority') ?? 'normal',
            'category'    => $request->get_param('category'),
            'client_id'   => $this->is_agent_or_admin() && $request->get_param('client_id')
                ? (int) $request->get_param('client_id')
                : get_current_user_id(),
            'agent_id'    => $this->is_agent_or_admin() ? $request->get_param('agent_id') : null,
        ];

        $result = $this->service->create($data);
        if (is_wp_error($result)) {
            return $result;
        }

        $ticket = Ticket::find($result);
        return $this->success($this->service->format($ticket), 201);
    }

    public function update_ticket(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $ticket = Ticket::find((int) $request['id']);
        if (!$ticket) {
            return $this->error('not_found', __('Ticket not found.', 'ticketflow'), 404);
        }

        if (!$this->is_agent_or_admin() && (int) $ticket->client_id !== get_current_user_id()) {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }

        $data = [];
        $json = $request->get_json_params();

        // Clients can only update subject
        $allowed = $this->is_agent_or_admin()
            ? ['subject', 'status', 'priority', 'category', 'agent_id']
            : ['subject'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $json)) {
                $data[$field] = $json[$field];
            }
        }

        $result = $this->service->update($ticket->id, $data);
        if (is_wp_error($result)) {
            return $result;
        }

        $ticket = Ticket::find($ticket->id);
        return $this->success($this->service->format($ticket));
    }

    public function delete_ticket(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $ticket = Ticket::find((int) $request['id']);
        if (!$ticket) {
            return $this->error('not_found', __('Ticket not found.', 'ticketflow'), 404);
        }

        Ticket::delete($ticket->id);
        return $this->success(null, 204);
    }

    public function assign_ticket(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $agent_id = (int) $request->get_param('agent_id');
        if (!$agent_id) {
            return $this->error('missing_agent', __('Agent ID is required.', 'ticketflow'), 400);
        }

        $result = $this->service->assign((int) $request['id'], $agent_id);
        if (is_wp_error($result)) {
            return $result;
        }

        $ticket = Ticket::find((int) $request['id']);
        return $this->success($this->service->format($ticket));
    }

    public function close_ticket(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $ticket = Ticket::find((int) $request['id']);
        if (!$ticket) {
            return $this->error('not_found', __('Ticket not found.', 'ticketflow'), 404);
        }

        if (!$this->is_agent_or_admin() && (int) $ticket->client_id !== get_current_user_id()) {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }

        $result = $this->service->close($ticket->id);
        if (is_wp_error($result)) {
            return $result;
        }

        $ticket = Ticket::find($ticket->id);
        return $this->success($this->service->format($ticket));
    }

    public function reopen_ticket(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $ticket = Ticket::find((int) $request['id']);
        if (!$ticket) {
            return $this->error('not_found', __('Ticket not found.', 'ticketflow'), 404);
        }

        if (!$this->is_agent_or_admin() && (int) $ticket->client_id !== get_current_user_id()) {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }

        $result = $this->service->reopen($ticket->id);
        if (is_wp_error($result)) {
            return $result;
        }

        $ticket = Ticket::find($ticket->id);
        return $this->success($this->service->format($ticket));
    }
}
