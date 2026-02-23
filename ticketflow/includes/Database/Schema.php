<?php

namespace Ticketflow\Database;

defined('ABSPATH') || exit;

class Schema
{
    public static function table(string $name): string
    {
        global $wpdb;
        return $wpdb->prefix . 'ticketflow_' . $name;
    }

    public static function get_sql(): string
    {
        global $wpdb;
        $charset = $wpdb->get_charset_collate();
        $t       = fn(string $n) => self::table($n);

        return "
CREATE TABLE {$t('tickets')} (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    ticket_uid varchar(20) NOT NULL,
    subject varchar(255) NOT NULL,
    description longtext NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'open',
    priority varchar(20) NOT NULL DEFAULT 'normal',
    category varchar(100) DEFAULT NULL,
    client_id bigint(20) unsigned NOT NULL,
    agent_id bigint(20) unsigned DEFAULT NULL,
    sla_deadline datetime DEFAULT NULL,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at datetime DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY ticket_uid (ticket_uid),
    KEY status (status),
    KEY client_id (client_id),
    KEY agent_id (agent_id),
    KEY priority (priority),
    KEY created_at (created_at)
) {$charset};

CREATE TABLE {$t('replies')} (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    ticket_id bigint(20) unsigned NOT NULL,
    author_id bigint(20) unsigned NOT NULL,
    body longtext NOT NULL,
    is_internal tinyint(1) NOT NULL DEFAULT 0,
    reply_type varchar(20) NOT NULL DEFAULT 'reply',
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY ticket_id (ticket_id),
    KEY author_id (author_id)
) {$charset};

CREATE TABLE {$t('attachments')} (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    ticket_id bigint(20) unsigned NOT NULL,
    reply_id bigint(20) unsigned DEFAULT NULL,
    uploaded_by bigint(20) unsigned NOT NULL,
    file_name varchar(255) NOT NULL,
    file_path varchar(500) NOT NULL,
    file_size bigint(20) unsigned NOT NULL DEFAULT 0,
    mime_type varchar(100) NOT NULL,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY ticket_id (ticket_id),
    KEY reply_id (reply_id)
) {$charset};

CREATE TABLE {$t('activity_log')} (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    ticket_id bigint(20) unsigned NOT NULL,
    user_id bigint(20) unsigned DEFAULT NULL,
    action varchar(50) NOT NULL,
    old_value text DEFAULT NULL,
    new_value text DEFAULT NULL,
    metadata text DEFAULT NULL,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY ticket_id (ticket_id)
) {$charset};

CREATE TABLE {$t('magic_tokens')} (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    user_id bigint(20) unsigned NOT NULL,
    token_hash varchar(64) NOT NULL,
    expires_at datetime NOT NULL,
    used_at datetime DEFAULT NULL,
    ip_address varchar(45) DEFAULT NULL,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY token_hash (token_hash),
    KEY user_id (user_id),
    KEY expires_at (expires_at)
) {$charset};

CREATE TABLE {$t('saved_replies')} (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    title varchar(255) NOT NULL,
    body longtext NOT NULL,
    category varchar(100) DEFAULT NULL,
    is_shared tinyint(1) NOT NULL DEFAULT 1,
    created_by bigint(20) unsigned NOT NULL,
    use_count bigint(20) unsigned NOT NULL DEFAULT 0,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) {$charset};

CREATE TABLE {$t('ticket_meta')} (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    ticket_id bigint(20) unsigned NOT NULL,
    meta_key varchar(255) NOT NULL,
    meta_value longtext DEFAULT NULL,
    PRIMARY KEY (id),
    KEY ticket_id (ticket_id),
    KEY meta_key (meta_key(191))
) {$charset};
";
    }
}
