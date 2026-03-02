<?php

namespace Ticketflow\Auth;

defined('ABSPATH') || exit;

class Permissions
{
    /**
     * Check if the current user can view a specific ticket.
     */
    public static function can_view_ticket(object $ticket): bool
    {
        if (!is_user_logged_in()) {
            return false;
        }

        if (current_user_can('ticketflow_view_all_tickets')) {
            return true;
        }

        return current_user_can('ticketflow_view_own_tickets')
            && (int) $ticket->client_id === get_current_user_id();
    }

    /**
     * Check if the current user can modify a ticket.
     */
    public static function can_modify_ticket(object $ticket): bool
    {
        if (current_user_can('ticketflow_change_status')) {
            return true;
        }

        return (int) $ticket->client_id === get_current_user_id();
    }

    /**
     * Check if the current user is an agent or admin.
     */
    public static function is_staff(): bool
    {
        $user = wp_get_current_user();
        $staff_roles = ['administrator', 'ticketflow_admin', 'ticketflow_agent'];

        return !empty(array_intersect($staff_roles, $user->roles));
    }
}
