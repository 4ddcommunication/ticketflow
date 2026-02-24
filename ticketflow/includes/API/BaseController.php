<?php

namespace Ticketflow\API;

use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined('ABSPATH') || exit;

abstract class BaseController extends WP_REST_Controller
{
    public function __construct()
    {
        $this->namespace = 'ticketflow/v1';
    }

    protected function success(mixed $data = null, int $status = 200): WP_REST_Response
    {
        return new WP_REST_Response($data, $status);
    }

    protected function error(string $code, string $message, int $status = 400): WP_Error
    {
        return new WP_Error($code, $message, ['status' => $status]);
    }

    protected function paginated(array $result): WP_REST_Response
    {
        $response = new WP_REST_Response($result['items']);
        $response->header('X-WP-Total', (string) $result['total']);
        $response->header('X-WP-TotalPages', (string) $result['pages']);
        return $response;
    }

    public function is_authenticated(): bool
    {
        return is_user_logged_in();
    }

    public function check_auth(WP_REST_Request $request): true|WP_Error
    {
        if (!$this->is_authenticated()) {
            return $this->error('unauthorized', __('Authentication required.', 'ticketflow'), 401);
        }
        return true;
    }

    public function check_cap(string $capability): true|WP_Error
    {
        if (!current_user_can($capability)) {
            return $this->error('forbidden', __('You do not have permission.', 'ticketflow'), 403);
        }
        return true;
    }

    protected function get_pagination_args(WP_REST_Request $request): array
    {
        return [
            'page'     => max(1, (int) $request->get_param('page')),
            'per_page' => max(1, min(100, (int) ($request->get_param('per_page') ?: 20))),
        ];
    }

    public function get_role(): string
    {
        $user = wp_get_current_user();
        if (in_array('administrator', $user->roles, true) || in_array('ticketflow_admin', $user->roles, true)) {
            return 'admin';
        }
        if (in_array('ticketflow_agent', $user->roles, true)) {
            return 'agent';
        }
        return 'client';
    }

    public function is_agent_or_admin(): bool
    {
        return in_array($this->get_role(), ['agent', 'admin'], true);
    }
}
