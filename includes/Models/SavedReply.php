<?php

namespace Ticketflow\Models;

use Ticketflow\Database\Schema;

defined('ABSPATH') || exit;

class SavedReply
{
    private static function table(): string
    {
        return Schema::table('saved_replies');
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

    public static function get_all(array $args = []): array
    {
        global $wpdb;
        $table = self::table();

        $where  = ['1=1'];
        $values = [];

        if (!empty($args['category'])) {
            $where[]  = 'category = %s';
            $values[] = $args['category'];
        }
        if (isset($args['is_shared'])) {
            $where[]  = 'is_shared = %d';
            $values[] = (int) $args['is_shared'];
        }
        if (!empty($args['search'])) {
            $like     = '%' . $wpdb->esc_like($args['search']) . '%';
            $where[]  = '(title LIKE %s OR body LIKE %s)';
            $values[] = $like;
            $values[] = $like;
        }

        $where_sql = implode(' AND ', $where);
        $sql = "SELECT * FROM %i WHERE {$where_sql} ORDER BY use_count DESC, title ASC";
        $query_values = array_merge([self::table()], $values);

        return $wpdb->get_results($wpdb->prepare($sql, ...$query_values)) ?: [];
    }

    public static function increment_use(int $id): void
    {
        global $wpdb;
        $wpdb->query($wpdb->prepare(
            "UPDATE %i SET use_count = use_count + 1 WHERE id = %d",
            self::table(),
            $id
        ));
    }
}
