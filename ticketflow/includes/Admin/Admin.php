<?php

namespace Ticketflow\Admin;

defined('ABSPATH') || exit;

class Admin
{
    public function init(): void
    {
        add_action('admin_menu', [$this, 'add_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_assets']);
    }

    public function add_menu(): void
    {
        add_menu_page(
            __('Ticketflow', 'ticketflow'),
            __('Ticketflow', 'ticketflow'),
            'ticketflow_view_own_tickets',
            'ticketflow',
            [$this, 'render_app'],
            'dashicons-tickets-alt',
            26
        );
    }

    public function render_app(): void
    {
        echo '<div id="ticketflow-admin" class="wrap"></div>';
    }

    public function enqueue_assets(string $hook): void
    {
        if ($hook !== 'toplevel_page_ticketflow') {
            return;
        }

        $manifest_path = TICKETFLOW_DIR . 'assets/.vite/manifest.json';
        if (!file_exists($manifest_path)) {
            // Dev mode — Vite dev server
            wp_enqueue_script(
                'ticketflow-admin-vite',
                'http://localhost:5173/src/admin/main.tsx',
                [],
                null,
                true
            );
            $this->localize_script('ticketflow-admin-vite');
            return;
        }

        $base_url = TICKETFLOW_URL . 'assets/';

        wp_enqueue_style(
            'ticketflow-css',
            $base_url . 'styles/styles.css',
            [],
            TICKETFLOW_VERSION
        );

        wp_enqueue_script(
            'ticketflow-shared-js',
            $base_url . 'styles/chunks/' . $this->get_shared_chunk(),
            ['wp-element'],
            TICKETFLOW_VERSION,
            true
        );

        wp_enqueue_script(
            'ticketflow-admin-js',
            $base_url . 'admin/admin.js',
            ['ticketflow-shared-js'],
            TICKETFLOW_VERSION,
            true
        );

        $this->localize_script('ticketflow-admin-js');
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

    private function localize_script(string $handle): void
    {
        wp_localize_script($handle, 'ticketflowAdmin', [
            'apiUrl'   => rest_url('ticketflow/v1'),
            'nonce'    => wp_create_nonce('wp_rest'),
            'adminUrl' => admin_url(),
            'userId'   => get_current_user_id(),
        ]);
    }
}
