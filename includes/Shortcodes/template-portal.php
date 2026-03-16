<?php
defined('ABSPATH') || exit;

$base_url     = TICKETFLOW_URL . 'assets/';
$shared_chunk = \Ticketflow\Admin\Admin::get_shared_chunk();
$settings     = get_option('ticketflow_settings', []);
$accent       = $settings['portal_accent_color'] ?? '#4f46e5';
$company      = esc_attr($settings['company_name'] ?? get_bloginfo('name'));
$logo         = $settings['company_logo'] ?? '';
$error        = isset($_GET['ticketflow_error']) ? sanitize_text_field($_GET['ticketflow_error']) : '';

$config = [
    'apiUrl'      => rest_url('ticketflow/v1'),
    'nonce'       => wp_create_nonce('wp_rest'),
    'isLoggedIn'  => is_user_logged_in(),
    'accentColor' => $accent,
    'companyName' => $company,
    'companyLogo' => $logo,
    'error'       => $error,
    'locale'      => get_locale(),
];
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo esc_html($company); ?> — Support</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="stylesheet" href="<?php echo esc_url($base_url . 'styles/styles.css?ver=' . TICKETFLOW_VERSION); ?>">
    <link rel="stylesheet" href="<?php echo esc_url($base_url . 'fonts/inter.css?ver=' . TICKETFLOW_VERSION); ?>">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; min-height: 100vh; }
    </style>
</head>
<body>
    <div id="ticketflow-portal" data-config="<?php echo esc_attr(wp_json_encode($config)); ?>"></div>

    <script type="module" src="<?php echo esc_url($base_url . 'styles/chunks/' . $shared_chunk . '?ver=' . TICKETFLOW_VERSION); ?>"></script>
    <script type="module" src="<?php echo esc_url($base_url . 'portal/portal.js?ver=' . TICKETFLOW_VERSION); ?>"></script>
</body>
</html>
