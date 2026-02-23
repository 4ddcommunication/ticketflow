<?php

namespace Ticketflow\Admin;

defined('ABSPATH') || exit;

class Settings
{
    public static function get(string $key = '', mixed $default = null): mixed
    {
        $settings = get_option('ticketflow_settings', []);

        if ($key === '') {
            return $settings;
        }

        return $settings[$key] ?? $default;
    }

    public static function set(string $key, mixed $value): void
    {
        $settings = get_option('ticketflow_settings', []);
        $settings[$key] = $value;
        update_option('ticketflow_settings', $settings);
    }
}
