<?php

namespace Ticketflow;

defined('ABSPATH') || exit;

class Activator
{
    public static function activate(): void
    {
        self::create_tables();
        self::create_roles();
        self::grant_admin_caps();
        self::create_portal_page();
        self::create_upload_dir();
        self::set_defaults();
        self::schedule_cron();
        flush_rewrite_rules();
    }

    private static function create_tables(): void
    {
        Database\Migrator::run();
    }

    private static function create_roles(): void
    {
        $client_caps = [
            'ticketflow_view_own_tickets' => true,
            'ticketflow_create_tickets'   => true,
            'ticketflow_reply_tickets'    => true,
            'ticketflow_upload_files'     => true,
            'read'                        => true,
        ];

        $agent_caps = array_merge($client_caps, [
            'ticketflow_view_all_tickets'  => true,
            'ticketflow_add_internal_notes' => true,
            'ticketflow_change_status'     => true,
            'ticketflow_change_priority'   => true,
            'ticketflow_use_saved_replies' => true,
        ]);

        $admin_caps = array_merge($agent_caps, [
            'ticketflow_manage_settings'   => true,
            'ticketflow_assign_tickets'    => true,
            'ticketflow_delete_tickets'    => true,
            'ticketflow_manage_agents'     => true,
            'ticketflow_export'            => true,
            'ticketflow_view_reports'      => true,
            'ticketflow_manage_clients'    => true,
        ]);

        remove_role('ticketflow_client');
        remove_role('ticketflow_agent');
        remove_role('ticketflow_admin');

        add_role('ticketflow_client', __('Ticketflow Client', 'ticketflow'), $client_caps);
        add_role('ticketflow_agent', __('Ticketflow Agent', 'ticketflow'), $agent_caps);
        add_role('ticketflow_admin', __('Ticketflow Admin', 'ticketflow'), $admin_caps);
    }

    private static function grant_admin_caps(): void
    {
        $role = get_role('administrator');
        if (!$role) {
            return;
        }

        $caps = [
            'ticketflow_view_own_tickets',
            'ticketflow_create_tickets',
            'ticketflow_reply_tickets',
            'ticketflow_upload_files',
            'ticketflow_view_all_tickets',
            'ticketflow_add_internal_notes',
            'ticketflow_change_status',
            'ticketflow_change_priority',
            'ticketflow_use_saved_replies',
            'ticketflow_manage_settings',
            'ticketflow_assign_tickets',
            'ticketflow_delete_tickets',
            'ticketflow_manage_agents',
            'ticketflow_export',
            'ticketflow_view_reports',
            'ticketflow_manage_clients',
        ];

        foreach ($caps as $cap) {
            $role->add_cap($cap);
        }
    }

    private static function create_portal_page(): void
    {
        $page_id = get_option('ticketflow_portal_page_id');
        if ($page_id && get_post_status($page_id)) {
            return;
        }

        $page_id = wp_insert_post([
            'post_title'   => __('Support Portal', 'ticketflow'),
            'post_content' => '[ticketflow_portal]',
            'post_status'  => 'publish',
            'post_type'    => 'page',
        ]);

        if ($page_id && !is_wp_error($page_id)) {
            update_option('ticketflow_portal_page_id', $page_id);
        }
    }

    private static function create_upload_dir(): void
    {
        $upload_dir = wp_upload_dir();
        $tf_dir     = $upload_dir['basedir'] . '/ticketflow';

        if (!file_exists($tf_dir)) {
            wp_mkdir_p($tf_dir);
        }

        $htaccess = $tf_dir . '/.htaccess';
        if (!file_exists($htaccess)) {
            file_put_contents($htaccess, "Deny from all\n");
        }

        $index = $tf_dir . '/index.php';
        if (!file_exists($index)) {
            file_put_contents($index, "<?php\n// Silence is golden.\n");
        }
    }

    private static function set_defaults(): void
    {
        if (get_option('ticketflow_settings')) {
            return;
        }

        update_option('ticketflow_settings', [
            'company_name'       => get_bloginfo('name'),
            'company_logo'       => '',
            'categories'         => ['General', 'Billing', 'Technical', 'Feature Request'],
            'statuses'           => ['open', 'in_progress', 'waiting', 'resolved', 'closed'],
            'priorities'         => ['low', 'normal', 'high', 'urgent'],
            'sla_response_hours' => 24,
            'sla_resolve_hours'  => 72,
            'auto_close_days'    => 7,
            'allowed_file_types' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'txt', 'csv'],
            'max_file_size_mb'   => 10,
            'portal_accent_color' => '#4f46e5',
            'email_from_name'    => get_bloginfo('name'),
            'email_from_address' => get_option('admin_email'),
            'email_notifications' => true,
        ]);
    }

    private static function schedule_cron(): void
    {
        if (!wp_next_scheduled('ticketflow_cleanup_tokens')) {
            wp_schedule_event(time(), 'hourly', 'ticketflow_cleanup_tokens');
        }
        if (!wp_next_scheduled('ticketflow_auto_close_tickets')) {
            wp_schedule_event(time(), 'daily', 'ticketflow_auto_close_tickets');
        }
    }
}
