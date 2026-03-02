<?php
/**
 * Plugin Name: Ticketflow
 * Description: Agency ticket system — manage client support tickets with a modern dashboard and client portal.
 * Version: 1.0.4
 * Requires PHP: 8.0
 * Author: Ticketflow
 * Text Domain: ticketflow
 * Domain Path: /languages
 * License: GPL-2.0-or-later
 */

defined('ABSPATH') || exit;

define('TICKETFLOW_VERSION', '1.0.4');
define('TICKETFLOW_DB_VERSION', '1.0.0');
define('TICKETFLOW_FILE', __FILE__);
define('TICKETFLOW_DIR', plugin_dir_path(__FILE__));
define('TICKETFLOW_URL', plugin_dir_url(__FILE__));
define('TICKETFLOW_BASENAME', plugin_basename(__FILE__));

require_once TICKETFLOW_DIR . 'vendor/autoload.php';

register_activation_hook(__FILE__, [Ticketflow\Activator::class, 'activate']);
register_deactivation_hook(__FILE__, [Ticketflow\Deactivator::class, 'deactivate']);

add_action('plugins_loaded', function () {
    Ticketflow\Ticketflow::instance()->init();
});
