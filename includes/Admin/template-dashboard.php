<?php
defined('ABSPATH') || exit;

$base_url    = TICKETFLOW_URL . 'assets/';
$shared_chunk = \Ticketflow\Admin\Admin::get_shared_chunk();
$settings    = get_option('ticketflow_settings', []);
$accent      = $settings['portal_accent_color'] ?? '#4f46e5';
$company     = esc_attr($settings['company_name'] ?? get_bloginfo('name'));
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo esc_html($company); ?> — Ticketflow</title>
    <link rel="stylesheet" href="<?php echo esc_url($base_url . 'styles/styles.css?ver=' . TICKETFLOW_VERSION); ?>">
    <link rel="stylesheet" href="<?php echo esc_url($base_url . 'fonts/inter.css?ver=' . TICKETFLOW_VERSION); ?>">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, #ticketflow-admin { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; }
        #ticketflow-admin { min-height: 100vh; }
    </style>
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
            accentColor: <?php echo wp_json_encode($accent); ?>,
            logoutNonce: <?php echo wp_json_encode(wp_create_nonce('log-out')); ?>,
            logoutUrl: <?php echo wp_json_encode(wp_logout_url(home_url())); ?>
        };
    </script>
    <script type="module" src="<?php echo esc_url($base_url . 'styles/chunks/' . $shared_chunk . '?ver=' . TICKETFLOW_VERSION); ?>"></script>
    <script type="module" src="<?php echo esc_url($base_url . 'admin/admin.js?ver=' . TICKETFLOW_VERSION); ?>"></script>
</body>
</html>
