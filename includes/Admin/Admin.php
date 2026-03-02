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
        add_menu_page(
            __('Ticketflow', 'ticketflow'),
            __('Ticketflow', 'ticketflow'),
            'ticketflow_view_all_tickets',
            'ticketflow',
            [$this, 'render_admin_page'],
            'dashicons-tickets-alt',
            26
        );
    }

    /**
     * Render the wp-admin onboarding page.
     */
    public function render_admin_page(): void
    {
        $dashboard_page_id = get_option('ticketflow_dashboard_page_id');
        $portal_page_id    = get_option('ticketflow_portal_page_id');
        $dashboard_url     = $dashboard_page_id ? get_permalink($dashboard_page_id) : '#';
        $portal_url        = $portal_page_id ? get_permalink($portal_page_id) : '#';
        $settings          = get_option('ticketflow_settings', []);
        $company           = esc_html($settings['company_name'] ?? get_bloginfo('name'));

        $stats = $this->get_quick_stats();

        ?>
        <style>
            .tf-admin-wrap { max-width: 1200px; margin: 20px 20px 20px 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .tf-admin-header { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; margin-bottom: 24px; }
            .tf-admin-header h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 8px; }
            .tf-admin-header p { color: #6b7280; font-size: 14px; margin: 0 0 24px; }
            .tf-launch-btn { display: inline-block; background: #4f46e5; color: #fff; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; text-decoration: none; transition: background .15s; }
            .tf-launch-btn:hover, .tf-launch-btn:focus { background: #4338ca; color: #fff; }
            .tf-portal-link { display: inline-block; margin-left: 12px; color: #6b7280; font-size: 14px; text-decoration: none; }
            .tf-portal-link:hover { color: #111827; }
            .tf-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
            .tf-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
            .tf-card-label { font-size: 12px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: .05em; }
            .tf-card-value { font-size: 28px; font-weight: 700; color: #111827; margin-top: 4px; }
            .tf-guide { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; }
            .tf-guide h2 { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 16px; }
            .tf-guide-steps { list-style: none; padding: 0; margin: 0; counter-reset: step; }
            .tf-guide-steps li { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; counter-increment: step; }
            .tf-guide-steps li:last-child { border-bottom: none; }
            .tf-guide-steps li::before { content: counter(step); display: flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; background: #eef2ff; color: #4f46e5; border-radius: 50%; font-size: 12px; font-weight: 600; }
            .tf-guide-steps code { background: #f3f4f6; padding: 1px 6px; border-radius: 4px; font-size: 13px; color: #4b5563; }
        </style>
        <div class="tf-admin-wrap">
            <div class="tf-admin-header">
                <h1>Ticketflow</h1>
                <p><?php printf(esc_html__('Support ticket system for %s. Manage client tickets, track SLA, and collaborate with your team.', 'ticketflow'), $company); ?></p>
                <a href="<?php echo esc_url($dashboard_url); ?>" class="tf-launch-btn"><?php esc_html_e('Launch Dashboard', 'ticketflow'); ?> &rarr;</a>
                <a href="<?php echo esc_url($portal_url); ?>" class="tf-portal-link" target="_blank"><?php esc_html_e('View Client Portal', 'ticketflow'); ?> &nearr;</a>
            </div>

            <div class="tf-cards">
                <div class="tf-card">
                    <div class="tf-card-label"><?php esc_html_e('Total Tickets', 'ticketflow'); ?></div>
                    <div class="tf-card-value"><?php echo (int) $stats['total']; ?></div>
                </div>
                <div class="tf-card">
                    <div class="tf-card-label"><?php esc_html_e('Open', 'ticketflow'); ?></div>
                    <div class="tf-card-value"><?php echo (int) $stats['open']; ?></div>
                </div>
                <div class="tf-card">
                    <div class="tf-card-label"><?php esc_html_e('Unassigned', 'ticketflow'); ?></div>
                    <div class="tf-card-value"><?php echo (int) $stats['unassigned']; ?></div>
                </div>
            </div>

            <div class="tf-guide">
                <h2><?php esc_html_e('Getting Started', 'ticketflow'); ?></h2>
                <ol class="tf-guide-steps">
                    <li><?php printf(__('Add clients via the Dashboard under %1$sClients%2$s, or create WordPress users with the %3$ssubscriber%4$s or %3$sticketflow_client%4$s role.', 'ticketflow'), '<strong>', '</strong>', '<code>', '</code>'); ?></li>
                    <li><?php printf(__('Clients log in through the %1$sClient Portal%2$s using a magic link sent to their email — no password needed.', 'ticketflow'), '<strong>', '</strong>'); ?></li>
                    <li><?php printf(__('Assign staff the %1$sticketflow_agent%2$s or %1$sticketflow_admin%2$s role in %3$sUsers &rarr; Edit User%4$s to give them dashboard access.', 'ticketflow'), '<code>', '</code>', '<strong>', '</strong>'); ?></li>
                    <li><?php printf(__('Configure categories, SLA deadlines, email settings, and branding in %1$sDashboard &rarr; Settings%2$s.', 'ticketflow'), '<strong>', '</strong>'); ?></li>
                    <li><?php printf(__('Tickets flow through statuses: %1$sOpen%2$s &rarr; %1$sIn Progress%2$s &rarr; %1$sWaiting%2$s &rarr; %1$sResolved%2$s &rarr; %1$sClosed%2$s. Resolved tickets auto-close after the configured idle period.', 'ticketflow'), '<strong>', '</strong>'); ?></li>
                </ol>
            </div>
        </div>
        <?php
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

    private function get_quick_stats(): array
    {
        global $wpdb;
        $table = \Ticketflow\Database\Schema::table('tickets');

        $total = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}");
        $open  = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM %i WHERE status IN ('open','in_progress','waiting')", $table));
        $unassigned = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM %i WHERE agent_id IS NULL AND status != 'closed'", $table));

        return compact('total', 'open', 'unassigned');
    }
}
