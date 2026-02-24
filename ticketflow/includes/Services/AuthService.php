<?php

namespace Ticketflow\Services;

use Ticketflow\Models\MagicToken;
use WP_Error;
use WP_User;

defined('ABSPATH') || exit;

class AuthService
{
    public function request_magic_link(string $email): true|WP_Error
    {
        $email = sanitize_email($email);
        if (!is_email($email)) {
            return new WP_Error('invalid_email', __('Invalid email address.', 'ticketflow'), ['status' => 400]);
        }

        $user = get_user_by('email', $email);
        if (!$user) {
            return new WP_Error('not_a_client', __('No account found with this email. Please contact support to get access.', 'ticketflow'), ['status' => 404]);
        }

        // Rate limit: max 3 per 15 minutes
        $recent = MagicToken::count_recent($user->ID, 15);
        if ($recent >= 3) {
            return new WP_Error('rate_limited', __('Too many requests. Please try again later.', 'ticketflow'), ['status' => 429]);
        }

        // Generate token
        $raw_token  = bin2hex(random_bytes(32));
        $token_hash = hash('sha256', $raw_token);

        MagicToken::create([
            'user_id'    => $user->ID,
            'token_hash' => $token_hash,
            'expires_at' => gmdate('Y-m-d H:i:s', time() + 900), // 15 minutes
        ]);

        // Build magic link URL
        $portal_page_id = get_option('ticketflow_portal_page_id');
        $portal_url     = $portal_page_id ? get_permalink($portal_page_id) : home_url();
        $magic_url      = add_query_arg('ticketflow_token', $raw_token, $portal_url);

        /**
         * Fires when a magic link is requested.
         *
         * @param WP_User $user      The user.
         * @param string  $magic_url The magic link URL.
         */
        do_action('ticketflow_magic_link_requested', $user, $magic_url);

        return true;
    }

    public function verify_token(string $raw_token): int|WP_Error
    {
        $token_hash = hash('sha256', $raw_token);
        $record     = MagicToken::find_by_hash($token_hash);

        if (!$record) {
            return new WP_Error('invalid_token', __('Invalid or expired token.', 'ticketflow'), ['status' => 401]);
        }

        MagicToken::mark_used($record->id, $this->get_client_ip());

        return (int) $record->user_id;
    }

    public function get_current_user_data(): ?array
    {
        $user = wp_get_current_user();
        if (!$user->exists()) {
            return null;
        }

        return [
            'id'    => $user->ID,
            'email' => $user->user_email,
            'name'  => $user->display_name,
            'role'  => $this->get_ticketflow_role($user),
            'caps'  => $this->get_ticketflow_caps($user),
        ];
    }

    public function get_ticketflow_role(WP_User $user): string
    {
        if (in_array('administrator', $user->roles, true) || in_array('ticketflow_admin', $user->roles, true)) {
            return 'admin';
        }
        if (in_array('ticketflow_agent', $user->roles, true)) {
            return 'agent';
        }
        return 'client';
    }

    public function get_ticketflow_caps(WP_User $user): array
    {
        $tf_caps = [];
        foreach ($user->allcaps as $cap => $has) {
            if ($has && str_starts_with($cap, 'ticketflow_')) {
                $tf_caps[] = $cap;
            }
        }
        return $tf_caps;
    }

    public static function cleanup_expired_tokens(): void
    {
        MagicToken::cleanup_expired();
    }

    private function get_client_ip(): string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        return sanitize_text_field($ip);
    }
}
