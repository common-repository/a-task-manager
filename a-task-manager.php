<?php
/**
 * Plugin Name:       A Task Manager
 * Description:       Task manager for wordpress. Allows users to create todo lists in the wordpress back-end.
 * Version:           1.0.0
 * Requires at least: 5.0
 * Requires PHP:      5.4
 * Author:            Oleg Oleshchuk
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       a-task-manager
 * Domain Path:       /languages
 */
defined('ABSPATH') or die('nothing here');
define("ATASKMANAGER_VERSION", '1.0.0');



add_action('admin_bar_menu', 'ataskmanager_add_menu_item', 100);

function ataskmanager_add_menu_item($admin_bar) {
    global $pagenow;
    $admin_bar->add_menu(array('id' => 'ataskmanager_top_item', 'title' => '<span class="ataskmanager-icon"></span> Tasks', 'href' => '#'));
}

add_action('admin_footer', 'ataskmanager_admin_footer_script');

function ataskmanager_admin_footer_script() {
    ?>
    <script type="text/javascript" >
        jQuery("li#ataskmanager_top_item .ab-item").on("click", function () {
            var data = {
                'action': 'ataskmanager_get_current_tasks',
            };


            jQuery.post(ajaxurl, data, function (response) {
                alert(response);
            });

        });
    </script> <?php
}

add_action('wp_ajax_ataskmanager_get_current_tasks', 'ataskmanager_get_current_tasks_callback');

function ataskmanager_get_current_tasks_callback() {
    $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : false;
    if (!is_user_logged_in() || !wp_verify_nonce($nonce, 'ajax-nonce')) {
        return;
    }

    global $table_prefix, $wpdb;
    $tblname = 'ataskmanager';
    $ataskmanager_table = $table_prefix . $tblname;

    $limit = isset($_POST['ataskmanager_tasks_page']) && $_POST['ataskmanager_tasks_page'] ? "" : " LIMIT 10 ";

    $tasks = $wpdb->get_results("SELECT * FROM `$ataskmanager_table` WHERE assigned_user_id = '" . get_current_user_id() . "' ORDER BY status, id " . $limit, OBJECT);

    foreach ($tasks as $record_id => $task_obj) {
        $tasks[$record_id]->title = stripslashes($task_obj->title);
    }

    wp_send_json($tasks);
}

add_action('wp_ajax_ataskmanager_count_current_tasks', 'ataskmanager_count_current_tasks_callback');

function ataskmanager_count_current_tasks_callback() {
    $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : false;
    if (!is_user_logged_in() || !wp_verify_nonce($nonce, 'ajax-nonce')) {
        return;
    }

    global $table_prefix, $wpdb;
    $tblname = 'ataskmanager';
    $ataskmanager_table = $table_prefix . $tblname;

    $tasks = $wpdb->get_var("SELECT COUNT(*) FROM `$ataskmanager_table` WHERE assigned_user_id = '" . get_current_user_id() . "' AND status = 0; ");

    wp_send_json($tasks);
}

add_action('wp_ajax_ataskmanager_add_new_task', 'ataskmanager_add_new_task_callback');

function ataskmanager_add_new_task_callback() {

    global $table_prefix, $wpdb;
    $tblname = 'ataskmanager';

    $task_title = sanitize_text_field(htmlentities($_POST['task_title']));

    $ataskmanager_table = $table_prefix . $tblname;
    $wpdb->insert($ataskmanager_table, array(
        'title' => $task_title,
        'created_user_id' => get_current_user_id(),
        'assigned_user_id' => get_current_user_id(),
        'created_time' => date("Y-m-d H:i:s"),
        'updated_time' => '',
        'content' => '',
        'status' => 0,
        'priority' => 0
    ));

    wp_send_json(['success' => $wpdb->insert_id]);
}

add_action('wp_ajax_ataskmanager_update_task_status', 'ataskmanager_update_task_status_callback');

function ataskmanager_update_task_status_callback() {

    global $table_prefix, $wpdb;
    $tblname = 'ataskmanager';
    $ataskmanager_table = $table_prefix . $tblname;
    $wpdb->update($ataskmanager_table, array(
        'status' => intval($_POST['ataskmanagertatus']),
        'updated_time' => date("Y-m-d H:i:s")),
            array("id" => intval($_POST['wptaskid'])));

    wp_send_json(array("success" => true));
}

add_action('wp_ajax_ataskmanager_update_task', 'ataskmanager_update_task_callback');

function ataskmanager_update_task_callback() {

    global $table_prefix, $wpdb;
    $tblname = 'ataskmanager';
    $ataskmanager_table = $table_prefix . $tblname;
    $task_title = sanitize_text_field(htmlentities($_POST['wptasktitle']));
    $wpdb->update($ataskmanager_table, array(
        'title' => $task_title,
        'updated_time' => date("Y-m-d H:i:s")),
            array("id" => intval($_POST['wptaskid'])));

    wp_send_json(array("success" => true));
}

add_action('wp_ajax_ataskmanager_delete_task', 'ataskmanager_delete_task_callback');

function ataskmanager_delete_task_callback() {

    global $table_prefix, $wpdb;
    $tblname = 'ataskmanager';
    $ataskmanager_table = $table_prefix . $tblname;
    $wpdb->delete($ataskmanager_table, array("id" => intval($_POST['wptaskid'])));

    wp_send_json(array("success" => true));
}

add_action('admin_enqueue_scripts', 'ataskmanager_load_admin_assets');

function ataskmanager_load_admin_assets() {
    wp_enqueue_style('ataskmanager_css', plugin_dir_url(__FILE__) . '/ataskmanager.css', false, '1.0.0');
    wp_enqueue_script('ataskmanager.js', plugin_dir_url(__FILE__) . '/ataskmanager.js', array('jquery'), '1.0.0', true);
    wp_localize_script('ataskmanager.js', 'ataskmanager_ajax_vars', array(
        'url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('ajax-nonce')
    ));
}

function create_ataskmanager_database_table() {
    global $table_prefix, $wpdb;

    $tblname = 'ataskmanager';
    $ataskmanager_table = $table_prefix . $tblname;

    $version = get_option('ataskmanager_plugin_version', '0.0.0');

    if ($version < ATASKMANAGER_VERSION || $wpdb->get_var("SHOW TABLES LIKE '{$ataskmanager_table}'") != $ataskmanager_table) {

        $sql = "CREATE TABLE IF NOT EXISTS `" . $ataskmanager_table . "`  ( ";
        $sql .= "  `id`  int(11)   NOT NULL auto_increment, ";
        $sql .= "  `created_user_id` int(11) NOT NULL, ";
        $sql .= "  `assigned_user_id` int(11) NOT NULL, ";
        $sql .= "  `created_time` datetime NOT NULL, ";
        $sql .= "  `updated_time` datetime NOT NULL, ";
        $sql .= "  `title` text NOT NULL, ";
        $sql .= "  `content` longtext NOT NULL, ";
        $sql .= "  `status` varchar(255) NOT NULL, ";
        $sql .= "  `priority` int(11) NOT NULL DEFAULT '0', ";
        $sql .= "  PRIMARY KEY `id` (`id`) ";
        $sql .= ") ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ; ";
        require_once( ABSPATH . '/wp-admin/includes/upgrade.php' );
        dbDelta($sql);
    }

    update_option('ataskmanager_plugin_version', ATASKMANAGER_VERSION, false);
}

register_activation_hook(__FILE__, 'create_ataskmanager_database_table');


register_uninstall_hook(__FILE__, 'ataskmanager_remove_tables');

function ataskmanager_remove_tables() {
    global $table_prefix, $wpdb;
    $tblname = 'ataskmanager';
    $ataskmanager_table = $table_prefix . $tblname;
    $sql = "DROP TABLE IF EXISTS `$ataskmanager_table`";
    $wpdb->query($sql);
    delete_option("ataskmanager_plugin_version");
}

add_action('in_admin_header', 'ataskmanager_html_popup');

function ataskmanager_html_popup() {
    include __DIR__ . "/templates/popup.php";
}

add_action('admin_menu', 'ataskmanager_admin_menu');

function ataskmanager_admin_menu() {
    $page_title = 'A Task Manager';
    $menu_title = 'A Task Manager';
    $capability = 'manage_options';
    $menu_slug = 'wp-tasks';
    $function = 'ataskmanager_dashboard';
    $icon_url = 'dashicons-editor-ol';
    $position = 4;
    add_menu_page($page_title, $menu_title, $capability, $menu_slug, $function, $icon_url, $position);
}

function ataskmanager_dashboard() {
    ?><h2>My Tasks</h2>
    <hr>
    <div class="ataskmanager_add_new">
        <form action="#" id="ataskmanager_page_add_new_form" data-page="true">
            <input type="text" id="ataskmanager_page_new_task" placeholder="new task"><button id="ataskmanager_page_new_task_button" type="submit"><span class="dashicons dashicons-plus"></span></button>
        </form>
    </div>

    <hr>
    <script>window.ataskmanager_all_page = true;window.ataskmanager_updated = false;window.ataskmanager_loaded = false;</script>
    <ul class="ataskmanager_list ataskmanager_list_lg">

    </ul>

    <?php
}
