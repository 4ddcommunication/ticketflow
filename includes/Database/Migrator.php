<?php

namespace Ticketflow\Database;

defined('ABSPATH') || exit;

class Migrator
{
    public static function run(): void
    {
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta(Schema::get_sql());
        update_option('ticketflow_db_version', TICKETFLOW_DB_VERSION);
    }

    public static function drop_all_tables(): void
    {
        global $wpdb;

        $tables = [
            'ticket_meta',
            'saved_replies',
            'magic_tokens',
            'activity_log',
            'attachments',
            'replies',
            'tickets',
        ];

        foreach ($tables as $table) {
            $name = Schema::table($table);
            $wpdb->query("DROP TABLE IF EXISTS {$name}"); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        }

        delete_option('ticketflow_db_version');
    }
}
