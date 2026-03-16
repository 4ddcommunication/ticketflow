<?php

namespace Ticketflow;

defined('ABSPATH') || exit;

final class Ticketflow
{
    private static ?self $instance = null;

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {}

    public function init(): void
    {
        $this->check_db_version();
        $this->load_textdomain();

        // Services
        $activity_service   = new Services\ActivityService();
        $attachment_service  = new Services\AttachmentService();
        $ticket_service     = new Services\TicketService($activity_service);
        $auth_service       = new Services\AuthService();
        $email_service      = new Services\EmailService();

        // Auth interceptor (magic link token in URL)
        $magic_link = new Auth\MagicLink($auth_service);
        add_action('init', [$magic_link, 'intercept_token']);

        // Admin (menu + notices inside admin, template override on frontend)
        $admin = new Admin\Admin();
        $admin->init();
        if (is_admin()) {
            $this->admin_notices();
        }

        // Shortcode
        $portal = new Shortcodes\PortalShortcode();
        $portal->init();

        // REST API
        add_action('rest_api_init', function () use (
            $ticket_service,
            $activity_service,
            $attachment_service,
            $auth_service,
            $email_service,
        ) {
            $controllers = [
                new API\AuthController($auth_service),
                new API\TicketsController($ticket_service),
                new API\RepliesController($activity_service),
                new API\AttachmentsController($attachment_service),
                new API\ActivityController(),
                new API\DashboardController(),
                new API\UsersController(),
                new API\SettingsController(),
                new API\SavedRepliesController(),
            ];

            foreach ($controllers as $controller) {
                $controller->register_routes();
            }
        });

        // Cron
        add_action('ticketflow_cleanup_tokens', [Services\AuthService::class, 'cleanup_expired_tokens']);
        add_action('ticketflow_auto_close_tickets', [$ticket_service, 'auto_close_stale_tickets']);

        // Email hooks
        $email_service->register_hooks();

        // Company field on user profile
        $company_field = function (\WP_User $user): void {
            $company = get_user_meta($user->ID, 'ticketflow_company', true);
            ?>
            <h3><?php esc_html_e('Ticketflow', 'ticketflow'); ?></h3>
            <table class="form-table">
                <tr>
                    <th><label for="ticketflow_company"><?php esc_html_e('Company', 'ticketflow'); ?></label></th>
                    <td><input type="text" name="ticketflow_company" id="ticketflow_company" value="<?php echo esc_attr($company); ?>" class="regular-text" /></td>
                </tr>
            </table>
            <?php
        };
        add_action('show_user_profile', $company_field);
        add_action('edit_user_profile', $company_field);

        $save_company = function (int $user_id): void {
            if (!current_user_can('edit_user', $user_id)) return;
            if (isset($_POST['ticketflow_company'])) {
                update_user_meta($user_id, 'ticketflow_company', sanitize_text_field($_POST['ticketflow_company']));
            }
        };
        add_action('personal_options_update', $save_company);
        add_action('edit_user_profile_update', $save_company);
    }

    private function check_db_version(): void
    {
        $installed = get_option('ticketflow_db_version', '0');
        if (version_compare($installed, TICKETFLOW_DB_VERSION, '<')) {
            Database\Migrator::run();
        }
    }

    private function load_textdomain(): void
    {
        load_plugin_textdomain('ticketflow', false, dirname(TICKETFLOW_BASENAME) . '/languages');
    }

    private function admin_notices(): void
    {
        add_action('admin_notices', function () {
            // Check portal page exists
            $page_id = get_option('ticketflow_portal_page_id');
            if (!$page_id || !get_post_status($page_id)) {
                echo '<div class="notice notice-warning"><p>';
                echo esc_html__('Ticketflow: The portal page is missing. Please deactivate and reactivate the plugin to recreate it.', 'ticketflow');
                echo '</p></div>';
            }

            // Check upload dir writable
            $upload_dir = wp_upload_dir();
            $tf_dir = $upload_dir['basedir'] . '/ticketflow';
            if (!is_writable($tf_dir)) {
                echo '<div class="notice notice-warning"><p>';
                printf(
                    esc_html__('Ticketflow: Upload directory is not writable: %s', 'ticketflow'),
                    '<code>' . esc_html($tf_dir) . '</code>'
                );
                echo '</p></div>';
            }
        });
    }
}
