<?php

namespace Ticketflow\API;

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined('ABSPATH') || exit;

class SettingsController extends BaseController
{
    public function register_routes(): void
    {
        register_rest_route($this->namespace, '/settings', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_settings'],
                'permission_callback' => function () {
                    return $this->check_auth(new WP_REST_Request()) === true
                        && $this->check_cap('ticketflow_manage_settings') === true;
                },
            ],
            [
                'methods'             => 'PATCH',
                'callback'            => [$this, 'update_settings'],
                'permission_callback' => function () {
                    return $this->check_auth(new WP_REST_Request()) === true
                        && $this->check_cap('ticketflow_manage_settings') === true;
                },
            ],
        ]);
    }

    public function get_settings(WP_REST_Request $request): WP_REST_Response
    {
        $settings = get_option('ticketflow_settings', []);
        return $this->success($settings);
    }

    public function update_settings(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $current = get_option('ticketflow_settings', []);
        $input   = $request->get_json_params();

        $allowed = [
            'company_name',
            'company_logo',
            'categories',
            'statuses',
            'priorities',
            'sla_response_hours',
            'sla_resolve_hours',
            'auto_close_days',
            'allowed_file_types',
            'max_file_size_mb',
            'portal_accent_color',
            'email_from_name',
            'email_from_address',
            'email_notifications',
        ];

        foreach ($allowed as $key) {
            if (array_key_exists($key, $input)) {
                $value = $input[$key];

                $current[$key] = match ($key) {
                    'company_name', 'company_logo', 'portal_accent_color', 'email_from_name' => sanitize_text_field($value),
                    'email_from_address'     => sanitize_email($value),
                    'sla_response_hours', 'sla_resolve_hours', 'auto_close_days', 'max_file_size_mb' => max(0, (int) $value),
                    'email_notifications'    => (bool) $value,
                    'categories', 'statuses', 'priorities', 'allowed_file_types' => array_map('sanitize_text_field', (array) $value),
                    default                  => $value,
                };
            }
        }

        update_option('ticketflow_settings', $current);

        return $this->success($current);
    }
}
