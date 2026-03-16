<?php

namespace Ticketflow\Email;

defined('ABSPATH') || exit;

class EmailManager
{
    private array $settings;

    public function __construct()
    {
        $this->settings = get_option('ticketflow_settings', []);
    }

    /**
     * Send an email using a template.
     */
    public function send(string $to, string $subject, string $template, array $merge_tags = []): bool
    {
        $body = $this->render($template, $merge_tags);
        $body = $this->wrap_layout($subject, $body);

        $from_name  = $this->settings['email_from_name'] ?? get_bloginfo('name');
        $from_email = $this->settings['email_from_address'] ?? get_option('admin_email');

        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            "From: {$from_name} <{$from_email}>",
        ];

        // Email threading: group all emails for the same ticket
        $ticket_uid = $merge_tags['ticket_uid'] ?? '';
        if ($ticket_uid) {
            $domain = parse_url(home_url(), PHP_URL_HOST);
            $thread_id = "<{$ticket_uid}@{$domain}>";
            $headers[] = "Message-ID: <{$ticket_uid}." . time() . ".{$to}@{$domain}>";
            $headers[] = "In-Reply-To: {$thread_id}";
            $headers[] = "References: {$thread_id}";
        }

        return wp_mail($to, $subject, $body, $headers);
    }

    /**
     * Render a template with merge tags.
     */
    private function render(string $template, array $merge_tags): string
    {
        $file = TICKETFLOW_DIR . "includes/Email/templates/{$template}.php";

        if (!file_exists($file)) {
            return '';
        }

        /**
         * Filter merge tags before rendering.
         *
         * @param array  $merge_tags Merge tag values.
         * @param string $template   Template name.
         */
        $merge_tags = apply_filters('ticketflow_email_merge_tags', $merge_tags, $template);

        // Add default merge tags
        $merge_tags['company_name'] = $this->settings['company_name'] ?? get_bloginfo('name');
        $merge_tags['company_logo'] = $this->settings['company_logo'] ?? '';
        $merge_tags['site_url']     = home_url();
        $merge_tags['year']         = gmdate('Y');

        ob_start();
        extract($merge_tags, EXTR_SKIP);
        include $file;
        $content = ob_get_clean();

        // Replace {{tag}} placeholders
        foreach ($merge_tags as $key => $value) {
            if (is_string($value) || is_numeric($value)) {
                $content = str_replace('{{' . $key . '}}', (string) $value, $content);
            }
        }

        return $content;
    }

    /**
     * Wrap content in the base email layout.
     */
    private function wrap_layout(string $subject, string $content): string
    {
        $accent_color    = $this->settings['portal_accent_color'] ?? '#4f46e5';
        $company_name    = $this->settings['company_name'] ?? get_bloginfo('name');
        $logo_url        = home_url('/wp-content/uploads/2023/12/4dd_logo-1.png');
        $year            = gmdate('Y');
        $all_rights      = esc_html__('All rights reserved.', 'ticketflow');
        $locale          = get_locale();

        return <<<HTML
<!DOCTYPE html>
<html lang="{$locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{$subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<tr>
<td style="background:#f9fafb;padding:24px 32px;border-bottom:1px solid #e5e7eb;">
<img src="{$logo_url}" alt="{$company_name}" style="height:40px;width:auto;" />
</td>
</tr>
<tr>
<td style="padding:32px;">
{$content}
</td>
</tr>
<tr>
<td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
<p style="margin:0;font-size:12px;color:#9ca3af;">&copy; {$year} {$company_name}. {$all_rights}</p>
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>
HTML;
    }
}
