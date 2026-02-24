<?php
defined('ABSPATH') || exit;

$base_url    = TICKETFLOW_URL . 'assets/';
$shared_chunk = \Ticketflow\Admin\Admin::get_shared_chunk();
$settings    = get_option('ticketflow_settings', []);
$accent      = $settings['portal_accent_color'] ?? '#4f46e5';
$company     = esc_attr($settings['company_name'] ?? get_bloginfo('name'));

// Strip all theme/plugin styles and scripts — standalone page
add_action('wp_enqueue_scripts', function () {
    global $wp_styles, $wp_scripts;
    if ($wp_styles) {
        foreach ($wp_styles->registered as $handle => $dep) {
            if (strpos($handle, 'ticketflow') === false) {
                wp_dequeue_style($handle);
                wp_deregister_style($handle);
            }
        }
    }
    if ($wp_scripts) {
        foreach ($wp_scripts->registered as $handle => $dep) {
            if (strpos($handle, 'ticketflow') === false) {
                wp_dequeue_script($handle);
                wp_deregister_script($handle);
            }
        }
    }
}, 999);

// Remove WP emoji
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');

// Remove WP embed
remove_action('wp_head', 'wp_oembed_add_discovery_links');
remove_action('wp_head', 'wp_oembed_add_host_js');

// Remove other WP head clutter
remove_action('wp_head', 'rest_output_link_wp_head');
remove_action('wp_head', 'wp_resource_hints', 2);
remove_action('wp_head', 'feed_links', 2);
remove_action('wp_head', 'feed_links_extra', 3);
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'wp_shortlink_wp_head');
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo esc_html($company); ?> — Ticketflow</title>
    <link rel="stylesheet" href="<?php echo esc_url($base_url . 'styles/styles.css?ver=' . TICKETFLOW_VERSION); ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, #ticketflow-admin { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; }
        #ticketflow-admin { min-height: 100vh; }
    </style>
    <?php wp_head(); ?>
</head>
<body>
    <div id="ticketflow-admin"></div>

    <script>
        window.ticketflowAdmin = {
            apiUrl: <?php echo wp_json_encode(rest_url('ticketflow/v1')); ?>,
            nonce: <?php echo wp_json_encode(wp_create_nonce('wp_rest')); ?>,
            adminUrl: <?php echo wp_json_encode(admin_url()); ?>,
            userId: <?php echo (int) get_current_user_id(); ?>,
            portalUrl: <?php echo wp_json_encode(get_permalink(get_option('ticketflow_portal_page_id'))); ?>,
            companyName: <?php echo wp_json_encode($company); ?>,
            accentColor: <?php echo wp_json_encode($accent); ?>
        };
    </script>
    <script type="module" src="<?php echo esc_url($base_url . 'styles/chunks/' . $shared_chunk . '?ver=' . TICKETFLOW_VERSION); ?>"></script>
    <script type="module" src="<?php echo esc_url($base_url . 'admin/admin.js?ver=' . TICKETFLOW_VERSION); ?>"></script>
    <?php wp_footer(); ?>
</body>
</html>
