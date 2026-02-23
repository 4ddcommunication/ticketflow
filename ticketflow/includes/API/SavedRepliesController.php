<?php

namespace Ticketflow\API;

use Ticketflow\Models\SavedReply;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined('ABSPATH') || exit;

class SavedRepliesController extends BaseController
{
    public function register_routes(): void
    {
        register_rest_route($this->namespace, '/saved-replies', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'list_replies'],
                'permission_callback' => function () {
                    return $this->check_auth(new WP_REST_Request()) === true
                        && $this->check_cap('ticketflow_use_saved_replies') === true;
                },
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'create_reply'],
                'permission_callback' => function () {
                    return $this->check_auth(new WP_REST_Request()) === true
                        && $this->check_cap('ticketflow_use_saved_replies') === true;
                },
            ],
        ]);

        register_rest_route($this->namespace, '/saved-replies/(?P<id>\d+)', [
            [
                'methods'             => 'PATCH',
                'callback'            => [$this, 'update_reply'],
                'permission_callback' => function () {
                    return $this->check_auth(new WP_REST_Request()) === true
                        && $this->check_cap('ticketflow_use_saved_replies') === true;
                },
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'delete_reply'],
                'permission_callback' => function () {
                    return $this->check_auth(new WP_REST_Request()) === true
                        && $this->check_cap('ticketflow_use_saved_replies') === true;
                },
            ],
        ]);
    }

    public function list_replies(WP_REST_Request $request): WP_REST_Response
    {
        $args = [];
        if ($request->get_param('category')) {
            $args['category'] = sanitize_text_field($request->get_param('category'));
        }
        if ($request->get_param('search')) {
            $args['search'] = sanitize_text_field($request->get_param('search'));
        }

        $replies = SavedReply::get_all($args);
        $data    = array_map([$this, 'format'], $replies);

        return $this->success($data);
    }

    public function create_reply(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $title = $request->get_param('title');
        $body  = $request->get_param('body');

        if (empty($title) || empty($body)) {
            return $this->error('missing_fields', __('Title and body are required.', 'ticketflow'), 400);
        }

        $id = SavedReply::create([
            'title'      => sanitize_text_field($title),
            'body'       => wp_kses_post($body),
            'category'   => $request->get_param('category') ? sanitize_text_field($request->get_param('category')) : null,
            'is_shared'  => (int) ($request->get_param('is_shared') ?? true),
            'created_by' => get_current_user_id(),
        ]);

        if (!$id) {
            return $this->error('create_failed', __('Failed to create saved reply.', 'ticketflow'), 500);
        }

        $reply = SavedReply::find($id);
        return $this->success($this->format($reply), 201);
    }

    public function update_reply(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $reply = SavedReply::find((int) $request['id']);
        if (!$reply) {
            return $this->error('not_found', __('Saved reply not found.', 'ticketflow'), 404);
        }

        $data = [];
        $json = $request->get_json_params();

        if (isset($json['title'])) {
            $data['title'] = sanitize_text_field($json['title']);
        }
        if (isset($json['body'])) {
            $data['body'] = wp_kses_post($json['body']);
        }
        if (isset($json['category'])) {
            $data['category'] = sanitize_text_field($json['category']);
        }
        if (isset($json['is_shared'])) {
            $data['is_shared'] = (int) $json['is_shared'];
        }

        if (!empty($data)) {
            SavedReply::update($reply->id, $data);
        }

        $reply = SavedReply::find($reply->id);
        return $this->success($this->format($reply));
    }

    public function delete_reply(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $reply = SavedReply::find((int) $request['id']);
        if (!$reply) {
            return $this->error('not_found', __('Saved reply not found.', 'ticketflow'), 404);
        }

        SavedReply::delete($reply->id);
        return $this->success(null, 204);
    }

    private function format(object $reply): array
    {
        return [
            'id'         => (int) $reply->id,
            'title'      => $reply->title,
            'body'       => $reply->body,
            'category'   => $reply->category,
            'is_shared'  => (bool) $reply->is_shared,
            'use_count'  => (int) $reply->use_count,
            'created_at' => $reply->created_at,
            'updated_at' => $reply->updated_at,
        ];
    }
}
