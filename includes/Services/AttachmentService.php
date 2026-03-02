<?php

namespace Ticketflow\Services;

use Ticketflow\Models\Attachment;
use WP_Error;

defined('ABSPATH') || exit;

class AttachmentService
{
    public function upload(int $ticket_id, array $file, ?int $reply_id = null): int|WP_Error
    {
        $settings = get_option('ticketflow_settings', []);
        $allowed  = $settings['allowed_file_types'] ?? ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'zip', 'txt'];
        $max_size = ($settings['max_file_size_mb'] ?? 10) * 1024 * 1024;

        if ($file['error'] !== UPLOAD_ERR_OK) {
            return new WP_Error('upload_error', __('File upload failed.', 'ticketflow'), ['status' => 400]);
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed, true)) {
            return new WP_Error('invalid_type', __('File type not allowed.', 'ticketflow'), ['status' => 400]);
        }

        if ($file['size'] > $max_size) {
            return new WP_Error('file_too_large', __('File exceeds maximum size.', 'ticketflow'), ['status' => 400]);
        }

        $upload_dir = wp_upload_dir();
        $tf_dir     = $upload_dir['basedir'] . '/ticketflow/' . $ticket_id;
        wp_mkdir_p($tf_dir);

        $safe_name = wp_unique_filename($tf_dir, sanitize_file_name($file['name']));
        $dest      = $tf_dir . '/' . $safe_name;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            return new WP_Error('move_failed', __('Failed to save file.', 'ticketflow'), ['status' => 500]);
        }

        $id = Attachment::create([
            'ticket_id'   => $ticket_id,
            'reply_id'    => $reply_id,
            'uploaded_by'  => get_current_user_id(),
            'file_name'   => $safe_name,
            'file_path'   => 'ticketflow/' . $ticket_id . '/' . $safe_name,
            'file_size'   => $file['size'],
            'mime_type'   => $file['type'],
        ]);

        if (!$id) {
            @unlink($dest);
            return new WP_Error('db_error', __('Failed to record attachment.', 'ticketflow'), ['status' => 500]);
        }

        return $id;
    }

    public function get_file_path(object $attachment): string
    {
        $upload_dir = wp_upload_dir();
        return $upload_dir['basedir'] . '/' . $attachment->file_path;
    }

    public function delete_file(object $attachment): bool
    {
        $path = $this->get_file_path($attachment);
        if (file_exists($path)) {
            @unlink($path);
        }
        return Attachment::delete($attachment->id);
    }

    public function format(object $attachment): array
    {
        return [
            'id'         => (int) $attachment->id,
            'ticket_id'  => (int) $attachment->ticket_id,
            'reply_id'   => $attachment->reply_id ? (int) $attachment->reply_id : null,
            'file_name'  => $attachment->file_name,
            'file_size'  => (int) $attachment->file_size,
            'mime_type'  => $attachment->mime_type,
            'download_url' => rest_url("ticketflow/v1/attachments/{$attachment->id}/download"),
            'created_at' => $attachment->created_at,
        ];
    }
}
