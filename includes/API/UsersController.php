<?php

namespace Ticketflow\API;

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined('ABSPATH') || exit;

class UsersController extends BaseController
{
    public function register_routes(): void
    {
        register_rest_route($this->namespace, '/clients', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'list_clients'],
                'permission_callback' => function () {
                    return $this->check_auth(new WP_REST_Request()) === true && $this->is_agent_or_admin();
                },
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'create_client'],
                'permission_callback' => function () {
                    return $this->check_auth(new WP_REST_Request()) === true
                        && $this->check_cap('ticketflow_manage_clients') === true;
                },
            ],
        ]);

        register_rest_route($this->namespace, '/clients/(?P<id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_client'],
            'permission_callback' => function () {
                return $this->check_auth(new WP_REST_Request()) === true && $this->is_agent_or_admin();
            },
        ]);

        register_rest_route($this->namespace, '/agents', [
            'methods'             => 'GET',
            'callback'            => [$this, 'list_agents'],
            'permission_callback' => function () {
                return $this->check_auth(new WP_REST_Request()) === true && $this->is_agent_or_admin();
            },
        ]);
    }

    public function list_clients(WP_REST_Request $request): WP_REST_Response
    {
        $args = [
            'role__in' => ['ticketflow_client'],
            'orderby'  => 'display_name',
            'order'    => 'ASC',
        ];

        $search = $request->get_param('search');
        if ($search) {
            $args['search']         = '*' . sanitize_text_field($search) . '*';
            $args['search_columns'] = ['user_login', 'user_email', 'display_name'];
        }

        $per_page = max(1, min(100, (int) ($request->get_param('per_page') ?: 50)));
        $page     = max(1, (int) $request->get_param('page'));
        $args['number'] = $per_page;
        $args['paged']  = $page;

        $query = new \WP_User_Query($args);
        $users = $query->get_results();

        $data = array_map(function (\WP_User $user) {
            return $this->format_user($user);
        }, $users);

        $response = new WP_REST_Response($data);
        $response->header('X-WP-Total', (string) $query->get_total());
        $response->header('X-WP-TotalPages', (string) ceil($query->get_total() / $per_page));
        return $response;
    }

    public function get_client(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $user = get_userdata((int) $request['id']);
        if (!$user) {
            return $this->error('not_found', __('Client not found.', 'ticketflow'), 404);
        }

        return $this->success($this->format_user($user));
    }

    public function create_client(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $email = sanitize_email($request->get_param('email'));
        $name  = sanitize_text_field($request->get_param('name'));

        if (!$email || !is_email($email)) {
            return $this->error('invalid_email', __('Valid email is required.', 'ticketflow'), 400);
        }

        if (email_exists($email)) {
            return $this->error('email_exists', __('A user with this email already exists.', 'ticketflow'), 400);
        }

        $username = sanitize_user(strtolower(str_replace(' ', '.', $name ?: explode('@', $email)[0])));
        if (username_exists($username)) {
            $username .= wp_rand(100, 999);
        }

        $user_id = wp_insert_user([
            'user_login'   => $username,
            'user_email'   => $email,
            'display_name' => $name ?: $username,
            'user_pass'    => wp_generate_password(24),
            'role'         => 'ticketflow_client',
        ]);

        if (is_wp_error($user_id)) {
            return $user_id;
        }

        $user = get_userdata($user_id);
        return $this->success($this->format_user($user), 201);
    }

    public function list_agents(WP_REST_Request $request): WP_REST_Response
    {
        $query = new \WP_User_Query([
            'role__in' => ['ticketflow_agent', 'ticketflow_admin', 'administrator'],
            'orderby'  => 'display_name',
            'order'    => 'ASC',
        ]);

        $data = array_map(function (\WP_User $user) {
            return $this->format_user($user);
        }, $query->get_results());

        return $this->success($data);
    }

    private function format_user(\WP_User $user): array
    {
        return [
            'id'         => $user->ID,
            'name'       => $user->display_name,
            'email'      => $user->user_email,
            'role'       => (new \Ticketflow\Services\AuthService())->get_ticketflow_role($user),
            'registered' => $user->user_registered,
        ];
    }
}
