<?php

namespace Ticketflow\Auth;

use Ticketflow\Services\AuthService;

defined('ABSPATH') || exit;

class MagicLink
{
    public function __construct(
        private AuthService $auth
    ) {}

    /**
     * Intercept magic link tokens from URL on init.
     * Verifies the token, sets auth cookie, redirects to portal.
     */
    public function intercept_token(): void
    {
        if (empty($_GET['ticketflow_token'])) {
            return;
        }

        $raw_token = sanitize_text_field(wp_unslash($_GET['ticketflow_token']));
        if (empty($raw_token)) {
            return;
        }

        $user_id = $this->auth->verify_token($raw_token);

        if (is_wp_error($user_id)) {
            $portal_page_id = get_option('ticketflow_portal_page_id');
            $redirect       = $portal_page_id ? get_permalink($portal_page_id) : home_url();
            $redirect       = add_query_arg('ticketflow_error', 'invalid_token', $redirect);
            wp_safe_redirect($redirect);
            exit;
        }

        wp_set_auth_cookie($user_id, true);
        wp_set_current_user($user_id);

        $portal_page_id = get_option('ticketflow_portal_page_id');
        $redirect       = $portal_page_id ? get_permalink($portal_page_id) : home_url();

        wp_safe_redirect($redirect);
        exit;
    }
}
