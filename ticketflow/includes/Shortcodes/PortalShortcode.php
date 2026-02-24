<?php

namespace Ticketflow\Shortcodes;

defined('ABSPATH') || exit;

class PortalShortcode
{
    public function init(): void
    {
        add_filter('template_include', [$this, 'standalone_template']);
    }

    /**
     * Serve standalone template for the portal page.
     */
    public function standalone_template(string $template): string
    {
        $page_id = get_option('ticketflow_portal_page_id');
        if (!$page_id || !is_page($page_id)) {
            return $template;
        }

        return TICKETFLOW_DIR . 'includes/Shortcodes/template-portal.php';
    }
}
