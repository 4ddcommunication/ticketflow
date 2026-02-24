<?php

namespace Ticketflow\Admin;

defined('ABSPATH') || exit;

class Admin
{
    public function init(): void
    {
        add_action('admin_menu', [$this, 'add_menu']);

        // Intercept the dashboard page and serve standalone app
        add_filter('template_include', [$this, 'standalone_template']);
        add_filter('script_loader_tag', [$this, 'add_module_type'], 10, 3);
    }

    public function add_menu(): void
    {
        // WP admin menu redirects to standalone page
        $page_id = get_option('ticketflow_dashboard_page_id');
        $url = $page_id ? get_permalink($page_id) : admin_url();

        add_menu_page(
            __('Ticketflow', 'ticketflow'),
            __('Ticketflow', 'ticketflow'),
            'ticketflow_view_all_tickets',
            'ticketflow',
            '',
            'dashicons-tickets-alt',
            26
        );

        // Redirect the WP admin page to standalone
        global $submenu;
        if (isset($submenu['ticketflow'])) {
            $submenu['ticketflow'][0][2] = $url;
        }
    }

    /**
     * Serve standalone template for the dashboard page.
     */
    public function standalone_template(string $template): string
    {
        $page_id = get_option('ticketflow_dashboard_page_id');
        if (!$page_id || !is_page($page_id)) {
            return $template;
        }

        // Must be logged in with staff access
        if (!is_user_logged_in()) {
            wp_redirect(wp_login_url(get_permalink($page_id)));
            exit;
        }

        if (!current_user_can('ticketflow_view_all_tickets')) {
            wp_redirect(home_url());
            exit;
        }

        return TICKETFLOW_DIR . 'includes/Admin/template-dashboard.php';
    }

    public function add_module_type(string $tag, string $handle, string $src): string
    {
        if (in_array($handle, ['ticketflow-shared-js', 'ticketflow-admin-js'], true)) {
            $tag = str_replace('type="text/javascript"', 'type="module"', $tag);
            if (!str_contains($tag, 'type="module"')) {
                $tag = str_replace('<script ', '<script type="module" ', $tag);
            }
        }
        return $tag;
    }

    public static function get_shared_chunk(): string
    {
        $manifest_path = TICKETFLOW_DIR . 'assets/.vite/manifest.json';
        if (!file_exists($manifest_path)) {
            return 'styles.js';
        }

        $manifest = json_decode(file_get_contents($manifest_path), true);

        foreach ($manifest as $entry) {
            if (isset($entry['name']) && $entry['name'] === 'styles' && isset($entry['file'])) {
                return basename($entry['file']);
            }
        }

        return 'styles.js';
    }
}
