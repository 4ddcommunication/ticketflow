<?php

namespace Ticketflow;

defined('ABSPATH') || exit;

class Deactivator
{
    public static function deactivate(): void
    {
        wp_clear_scheduled_hook('ticketflow_cleanup_tokens');
        wp_clear_scheduled_hook('ticketflow_auto_close_tickets');
        flush_rewrite_rules();
    }
}
