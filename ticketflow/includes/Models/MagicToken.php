<?php

namespace Ticketflow\Models;

use Ticketflow\Database\Schema;

defined('ABSPATH') || exit;

class MagicToken
{
    private static function table(): string
    {
        return Schema::table('magic_tokens');
    }

    public static function create(array $data): int|false
    {
        global $wpdb;
        $data['created_at'] = current_time('mysql', true);
        $result = $wpdb->insert(self::table(), $data);
        return $result ? (int) $wpdb->insert_id : false;
    }

    public static function find_by_hash(string $hash): ?object
    {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM %i WHERE token_hash = %s AND used_at IS NULL AND expires_at > %s",
            self::table(),
            $hash,
            current_time('mysql', true)
        ));
    }

    public static function mark_used(int $id, string $ip): bool
    {
        global $wpdb;
        return (bool) $wpdb->update(
            self::table(),
            [
                'used_at'    => current_time('mysql', true),
                'ip_address' => $ip,
            ],
            ['id' => $id]
        );
    }

    public static function count_recent(int $user_id, int $minutes = 15): int
    {
        global $wpdb;
        $since = gmdate('Y-m-d H:i:s', time() - ($minutes * 60));
        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM %i WHERE user_id = %d AND created_at > %s",
            self::table(),
            $user_id,
            $since
        ));
    }

    public static function cleanup_expired(): int
    {
        global $wpdb;
        return (int) $wpdb->query($wpdb->prepare(
            "DELETE FROM %i WHERE expires_at < %s",
            self::table(),
            current_time('mysql', true)
        ));
    }
}
