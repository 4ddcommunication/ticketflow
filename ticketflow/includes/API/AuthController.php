<?php

namespace Ticketflow\API;

use Ticketflow\Services\AuthService;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined('ABSPATH') || exit;

class AuthController extends BaseController
{
    public function __construct(
        private AuthService $service
    ) {}

    public function register_routes(): void
    {
        register_rest_route($this->namespace, '/auth/magic-link', [
            'methods'             => 'POST',
            'callback'            => [$this, 'request_magic_link'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route($this->namespace, '/auth/verify', [
            'methods'             => 'GET',
            'callback'            => [$this, 'verify_token'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route($this->namespace, '/auth/me', [
            'methods'             => 'GET',
            'callback'            => [$this, 'me'],
            'permission_callback' => [$this, 'check_auth'],
        ]);

        register_rest_route($this->namespace, '/auth/logout', [
            'methods'             => 'POST',
            'callback'            => [$this, 'logout'],
            'permission_callback' => [$this, 'check_auth'],
        ]);
    }

    public function request_magic_link(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $email = $request->get_param('email');
        if (empty($email)) {
            return $this->error('missing_email', __('Email is required.', 'ticketflow'), 400);
        }

        $result = $this->service->request_magic_link($email);
        if (is_wp_error($result)) {
            return $result;
        }

        // Always return success to not reveal user existence
        return $this->success([
            'message' => __('If an account exists with that email, a login link has been sent.', 'ticketflow'),
        ]);
    }

    public function verify_token(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $token = $request->get_param('token');
        if (empty($token)) {
            return $this->error('missing_token', __('Token is required.', 'ticketflow'), 400);
        }

        $user_id = $this->service->verify_token($token);
        if (is_wp_error($user_id)) {
            return $user_id;
        }

        wp_set_auth_cookie($user_id, true);
        wp_set_current_user($user_id);

        return $this->success($this->service->get_current_user_data());
    }

    public function me(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $data = $this->service->get_current_user_data();
        if (!$data) {
            return $this->error('unauthorized', __('Not authenticated.', 'ticketflow'), 401);
        }
        return $this->success($data);
    }

    public function logout(WP_REST_Request $request): WP_REST_Response
    {
        wp_logout();
        return $this->success(['message' => __('Logged out.', 'ticketflow')]);
    }
}
