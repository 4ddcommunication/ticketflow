<?php
/**
 * Fired when the plugin is uninstalled.
 * Drops all custom tables, removes roles, capabilities, options, and upload directory.
 */

defined('WP_UNINSTALL_PLUGIN') || exit;

require_once __DIR__ . '/vendor/autoload.php';

// Drop all tables
Ticketflow\Database\Migrator::drop_all_tables();

// Remove roles
remove_role('ticketflow_client');
remove_role('ticketflow_agent');
remove_role('ticketflow_admin');

// Remove caps from administrator
$admin_role = get_role('administrator');
if ($admin_role) {
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
        $admin_role->remove_cap($cap);
    }
}

// Remove portal page
$portal_page_id = get_option('ticketflow_portal_page_id');
if ($portal_page_id) {
    wp_delete_post($portal_page_id, true);
}

// Remove options
delete_option('ticketflow_settings');
delete_option('ticketflow_portal_page_id');
delete_option('ticketflow_db_version');

// Remove upload directory
$upload_dir = wp_upload_dir();
$tf_dir     = $upload_dir['basedir'] . '/ticketflow';
if (is_dir($tf_dir)) {
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($tf_dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($files as $file) {
        if ($file->isDir()) {
            rmdir($file->getRealPath());
        } else {
            unlink($file->getRealPath());
        }
    }
    rmdir($tf_dir);
}
