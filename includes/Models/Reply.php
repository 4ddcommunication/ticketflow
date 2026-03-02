<?php

namespace Ticketflow\Models;

use Ticketflow\Database\Schema;

defined('ABSPATH') || exit;

class Reply
{
    private static function table(): string
    {
        return Schema::table('replies');
    }

    public static function find(int $id): ?object
    {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM %i WHERE id = %d",
            self::table(),
            $id
        ));
    }

    public static function create(array $data): int|false
    {
        global $wpdb;
        $data['created_at'] = current_time('mysql', true);
        $data['updated_at'] = current_time('mysql', true);
        $result = $wpdb->insert(self::table(), $data);
        return $result ? (int) $wpdb->insert_id : false;
    }

    public static function update(int $id, array $data): bool
    {
        global $wpdb;
        $data['updated_at'] = current_time('mysql', true);
        return (bool) $wpdb->update(self::table(), $data, ['id' => $id]);
    }

    public static function delete(int $id): bool
    {
        global $wpdb;
        return (bool) $wpdb->delete(self::table(), ['id' => $id]);
    }

    public static function get_by_ticket(int $ticket_id, bool $include_internal = true): array
    {
        global $wpdb;

        if ($include_internal) {
            $results = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM %i WHERE ticket_id = %d ORDER BY created_at ASC",
                self::table(),
                $ticket_id
            ));
        } else {
            $results = $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM %i WHERE ticket_id = %d AND is_internal = 0 ORDER BY created_at ASC",
                self::table(),
                $ticket_id
            ));
        }

        return $results ?: [];
    }

    public static function count_by_ticket(int $ticket_id): int
    {
        global $wpdb;
        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM %i WHERE ticket_id = %d",
            self::table(),
            $ticket_id
        ));
    }
}
