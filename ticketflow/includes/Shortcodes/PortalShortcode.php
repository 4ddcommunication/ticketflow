<?php

namespace Ticketflow\Shortcodes;

defined('ABSPATH') || exit;

class PortalShortcode
{
    public function init(): void
    {
        add_shortcode('ticketflow_portal', [$this, 'render']);
        add_filter('script_loader_tag', [$this, 'add_module_type'], 10, 3);
    }

    public function render(array $atts = []): string
    {
        $this->enqueue_assets();

        $settings    = get_option('ticketflow_settings', []);
        $accent      = $settings['portal_accent_color'] ?? '#4f46e5';
        $company     = esc_attr($settings['company_name'] ?? get_bloginfo('name'));
        $error       = isset($_GET['ticketflow_error']) ? sanitize_text_field($_GET['ticketflow_error']) : '';

        $config = [
            'apiUrl'       => rest_url('ticketflow/v1'),
            'nonce'        => wp_create_nonce('wp_rest'),
            'isLoggedIn'   => is_user_logged_in(),
            'accentColor'  => $accent,
            'companyName'  => $company,
            'error'        => $error,
        ];

        $json = esc_attr(wp_json_encode($config));

        return "<div id=\"ticketflow-portal\" data-config=\"{$json}\"></div>";
    }

    /**
     * Add type="module" to our script tags so ES module imports work.
     */
    public function add_module_type(string $tag, string $handle, string $src): string
    {
        if (in_array($handle, ['ticketflow-shared-js', 'ticketflow-portal-js', 'ticketflow-portal-vite'], true)) {
            $tag = str_replace(' src=', ' type="module" src=', $tag);
        }
        return $tag;
    }

    private function enqueue_assets(): void
    {
        $manifest_path = TICKETFLOW_DIR . 'assets/.vite/manifest.json';

        if (!file_exists($manifest_path)) {
            wp_enqueue_script(
                'ticketflow-portal-vite',
                'http://localhost:5173/src/portal/main.tsx',
                [],
                null,
                true
            );
            return;
        }

        $base_url = TICKETFLOW_URL . 'assets/';

        wp_enqueue_style(
            'ticketflow-portal-css',
            $base_url . 'styles/styles.css',
            [],
            TICKETFLOW_VERSION
        );

        $shared_chunk = $this->get_shared_chunk();
        wp_enqueue_script(
            'ticketflow-shared-js',
            $base_url . 'styles/chunks/' . $shared_chunk,
            [],
            TICKETFLOW_VERSION,
            true
        );

        wp_enqueue_script(
            'ticketflow-portal-js',
            $base_url . 'portal/portal.js',
            ['ticketflow-shared-js'],
            TICKETFLOW_VERSION,
            true
        );
    }

    private function get_shared_chunk(): string
    {
        $manifest_path = TICKETFLOW_DIR . 'assets/.vite/manifest.json';
        $manifest = json_decode(file_get_contents($manifest_path), true);

        foreach ($manifest as $entry) {
            if (isset($entry['name']) && $entry['name'] === 'styles' && isset($entry['file'])) {
                return basename($entry['file']);
            }
        }

        return 'styles.js';
    }
}
