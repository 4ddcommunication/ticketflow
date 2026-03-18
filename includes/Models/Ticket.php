<?php

namespace Ticketflow\Models;

use Ticketflow\Database\Schema;

defined('ABSPATH') || exit;

class Ticket
{
    private static function table(): string
    {
        return Schema::table('tickets');
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

    public static function find_by_uid(string $uid): ?object
    {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM %i WHERE ticket_uid = %s",
            self::table(),
            $uid
        ));
    }

    public static function create(array $data): int|false
    {
        global $wpdb;

        $data['ticket_uid'] = self::generate_uid();
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

    public static function query(array $args = []): array
    {
        global $wpdb;
        $table = self::table();

        $defaults = [
            'status'    => null,
            'priority'  => null,
            'category'  => null,
            'client_id' => null,
            'agent_id'  => null,
            'search'    => null,
            'orderby'   => 'created_at',
            'order'     => 'DESC',
            'per_page'  => 20,
            'page'      => 1,
        ];

        $args   = wp_parse_args($args, $defaults);
        $where  = ['1=1'];
        $values = [];

        if ($args['status'] === 'active') {
            $where[] = "status NOT IN ('closed', 'resolved')";
        } elseif ($args['status']) {
            $where[]  = 'status = %s';
            $values[] = $args['status'];
        }
        if ($args['priority']) {
            $where[]  = 'priority = %s';
            $values[] = $args['priority'];
        }
        if ($args['category']) {
            $where[]  = 'category = %s';
            $values[] = $args['category'];
        }
        if ($args['client_id']) {
            $where[]  = 'client_id = %d';
            $values[] = $args['client_id'];
        }
        if ($args['agent_id']) {
            $where[]  = 'agent_id = %d';
            $values[] = $args['agent_id'];
        }
        if ($args['search']) {
            $like     = '%' . $wpdb->esc_like($args['search']) . '%';
            $where[]  = '(subject LIKE %s OR ticket_uid LIKE %s)';
            $values[] = $like;
            $values[] = $like;
        }

        $allowed_orderby = ['created_at', 'updated_at', 'priority', 'status', 'subject'];
        $orderby = in_array($args['orderby'], $allowed_orderby, true) ? $args['orderby'] : 'created_at';
        $order   = strtoupper($args['order']) === 'ASC' ? 'ASC' : 'DESC';

        $per_page = max(1, min(100, (int) $args['per_page']));
        $offset   = ($args['page'] - 1) * $per_page;

        $where_sql = implode(' AND ', $where);

        // Count
        $count_sql = "SELECT COUNT(*) FROM %i WHERE {$where_sql}";
        $count_values = array_merge([self::table()], $values);
        $total = (int) $wpdb->get_var($wpdb->prepare($count_sql, ...$count_values));

        // Results
        $sql = "SELECT * FROM %i WHERE {$where_sql} ORDER BY {$orderby} {$order} LIMIT %d OFFSET %d";
        $query_values = array_merge([self::table()], $values, [$per_page, $offset]);
        $items = $wpdb->get_results($wpdb->prepare($sql, ...$query_values));

        return [
            'items'    => $items ?: [],
            'total'    => $total,
            'page'     => (int) $args['page'],
            'per_page' => $per_page,
            'pages'    => (int) ceil($total / $per_page),
        ];
    }

    public static function count_by_status(): array
    {
        global $wpdb;
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT status, COUNT(*) as count FROM %i GROUP BY status",
            self::table()
        ));

        $counts = [];
        foreach ($results as $row) {
            $counts[$row->status] = (int) $row->count;
        }
        return $counts;
    }

    private static function generate_uid(): string
    {
        global $wpdb;
        $last = $wpdb->get_var($wpdb->prepare(
            "SELECT MAX(id) FROM %i",
            self::table()
        ));
        $next = ((int) $last) + 1;
        return 'TF-' . str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }
}
