(function ($) {


    if (window.ataskmanager_all_page)
    {

        ataskmanager_refresh_tasks();

    }
    
    
    $.post(ataskmanager_ajax_vars.url, {
                nonce: ataskmanager_ajax_vars.nonce,
                action: "ataskmanager_count_current_tasks"
            }, function (tasks) {
                if(tasks > 0)
                {
                     $("#wp-admin-bar-ataskmanager_top_item").find('span').removeClass('ataskmanager-icon').addClass('ataskmanager-remaining-tasks').html(tasks);
                }
              
            });


    function ataskmanager_refresh_tasks()
    {

        if (window.ataskmanager_updated || !window.ataskmanager_loaded)
        {

            $(".ataskmanager_popup .ataskmanager_list").html('');
            $(".ataskmanager_popup .ataskmanager_list").append('<div class="wpt-loader"><div></div><div></div><div></div></div>');

            if (window.ataskmanager_all_page)
            {
                $(".ataskmanager_list.ataskmanager_list_lg").html('');
                $(".ataskmanager_list.ataskmanager_list_lg").append('<div class="wpt-loader"><div></div><div></div><div></div></div>');
            }



            $.post(ataskmanager_ajax_vars.url, {
                nonce: ataskmanager_ajax_vars.nonce,
                action: "ataskmanager_get_current_tasks",
                ataskmanager_tasks_page: window.ataskmanager_all_page
            }, function (data) {

                $(".ataskmanager_popup .ataskmanager_list .wpt-loader").remove();

                if (window.ataskmanager_all_page)
                {
                    $(".ataskmanager_list.ataskmanager_list_lg .wpt-loader").remove();
                }


                if (!data)
                {
                    $(".ataskmanager_popup .ataskmanager_list").html('');
                } else
                {

                    var ataskmanager_tasks_limit = data.length < 10 ? data.length : 10;
                    for (index = 0; index < ataskmanager_tasks_limit; ++index)
                    {
                        if (data[index].status > 1)
                        {
                            break;
                        }
                        '<span class="dashicons dashicons-no"></span>' +
                                '<span class="dashicons dashicons-image-rotate"></span>';

                        var newtask = "<li data-id='" + data[index].id + "' class='ataskmanager_popup_task'><label class='ataskmanager_popup_item_label'><span class='ataskmanager_title'>" + data[index].title + "</span><input type='checkbox' " + (data[index].status == 1 ? "checked='checked'" : "") + " ><span class='ataskmanager_check_mark'></span></label></li>";
                        $(".ataskmanager_popup .ataskmanager_list").append(newtask);
                        $(".ataskmanager_popup .ataskmanager_list").find('label:last .ataskmanager_title').html(data[index].title);
                    }


                    if (window.ataskmanager_all_page)
                    {
                        for (index = 0; index < data.length; ++index)
                        {


                            var newtask = "<li data-id='" + data[index].id + "' class='ataskmanager_popup_task ataskmanager-status-" + data[index].status + "'>";


                            if (data[index].status == 2)
                            {
                                newtask += "<a href='javascript:void(0);' class='ataskmanager_recover_task'><span class='dashicons dashicons-image-rotate'></span></a>" + "<label class='ataskmanager_popup_item_label'>" + data[index].title + "</label><a href='javascript:void(0)' class='ataskmanager_delete_task'><span class='dashicons dashicons-no'></span></a>";
                            } else
                            {
                                newtask += "<label class='ataskmanager_popup_item_label'><span class='ataskmanager_title'></span><input type='checkbox' " + (data[index].status == 1 ? "checked='checked'" : "") + " ><span class='ataskmanager_check_mark'></span></label>"
                                        + "<a href='javascript:void(0)' class='ataskmanager_edit_task'><span class='dashicons dashicons-edit'></span></a>"
                                        + "<a href='javascript:void(0)' class='ataskmanager_save' style='display:none;'><span class='dashicons dashicons-album'></span></a>"
                                        + "<a href='javascript:void(0)' class='ataskmanager_trash_task'><span class='dashicons dashicons-trash'></span></a>";
                            }

                            newtask += "</li>";
                            $(".ataskmanager_list.ataskmanager_list_lg").append(newtask);
                            $(".ataskmanager_list.ataskmanager_list_lg").find('label:last .ataskmanager_title').html(data[index].title);
                        }

                    }

                    ataskmanager_add_list_events();
                    window.ataskmanager_loaded = true;
                    window.ataskmanager_updated = false;
                }

            });






        }
    }


    function ataskmanager_add_list_events()
    {
        $('.ataskmanager_popup_item_label input').click(function (e) {
            var ataskmanagerid = $(this).closest('li').data('id');
            var ataskmanagertatus = $(this).prop("checked") ? "1" : "0";


            $.post(ataskmanager_ajax_vars.url, {
                nonce: ataskmanager_ajax_vars.nonce,
                action: "ataskmanager_update_task_status",
                ataskmanagerid: ataskmanagerid,
                ataskmanagertatus: ataskmanagertatus
            }, function (data) {

                if (data.success)
                {
                    ataskmanager_message('success', "Task updated");
                    window.ataskmanager_updated = true;
                    ataskmanager_refresh_tasks();
                }

            });
        });


        $('.ataskmanager_list .ataskmanager_trash_task').click(function (e) {
            var ataskmanagerid = $(this).closest('li').data('id');
            var ataskmanagertatus = 2;


            $.post(ataskmanager_ajax_vars.url, {
                nonce: ataskmanager_ajax_vars.nonce,
                action: "ataskmanager_update_task_status",
                ataskmanagerid: ataskmanagerid,
                ataskmanagertatus: ataskmanagertatus
            }, function (data) {

                if (data.success)
                {
                    ataskmanager_message('success', "Task updated");
                    window.ataskmanager_updated = true;
                    ataskmanager_refresh_tasks();
                }

            });
        });

        $('.ataskmanager_list_lg .ataskmanager_edit_task').click(function (e) {
            e.preventDefault();
            var li = $(this).closest('li');
            var ataskmanagertitle = $(li).find('span.ataskmanager_title').text();
            $(li).find('label').addClass("ataskmanager_editing");
            $(li).find('span.ataskmanager_title').html('<input type="text" name="ataskmanager_title[]" value="">');
            $(li).find('span.ataskmanager_title input[type="text"]').val(ataskmanagertitle);
            $(li).find('span.ataskmanager_title input[type="text"]').focus();
            $(li).find('.ataskmanager_edit_task').hide();
            $(li).find('.ataskmanager_trash_task').hide();
            $(li).find('.ataskmanager_save').show();


            $(li).find('span.ataskmanager_title input[type="text"]').keypress(function (event) {
                var keycode = (event.keyCode ? event.keyCode : event.which);
                
                if (keycode == 13) {
                    $(li).find(' .ataskmanager_save').click();
                }
            });

        });


        $('.ataskmanager_list_lg .ataskmanager_save').click(function (e) {
            e.preventDefault();
            
            var li = $(this).closest('li');
            var ataskmanagerid = $(li).data('id');
            var ataskmanagertitle = $(li).find('span.ataskmanager_title input').val();
            $.post(ataskmanager_ajax_vars.url, {
                nonce: ataskmanager_ajax_vars.nonce,
                action: "ataskmanager_update_task",
                ataskmanagerid: ataskmanagerid,
                ataskmanagertitle: ataskmanagertitle
            }, function (data) {

                if (data.success)
                {

                    $(li).find('.ataskmanager_edit_task').show();
                    $(li).find('.ataskmanager_trash_task').show();
                    $(li).find('.ataskmanager_save').hide();
                    $(li).find('span.ataskmanager_title').html(ataskmanagertitle);

                    ataskmanager_message('success', "Task updated");
                    window.ataskmanager_updated = true;
                    ataskmanager_refresh_tasks();
                }

            });
        });


        $('.ataskmanager_list .ataskmanager_recover_task').click(function (e) {
            var ataskmanagerid = $(this).closest('li').data('id');
            var ataskmanagertatus = 1;
            e.preventDefault();

            $.post(ataskmanager_ajax_vars.url, {
                nonce: ataskmanager_ajax_vars.nonce,
                action: "ataskmanager_update_task_status",
                ataskmanagerid: ataskmanagerid,
                ataskmanagertatus: ataskmanagertatus
            }, function (data) {

                if (data.success)
                {
                    ataskmanager_message('success', "Task updated");
                    window.ataskmanager_updated = true;
                    ataskmanager_refresh_tasks();
                }

            });
        });


        $('.ataskmanager_list .ataskmanager_delete_task').click(function (e) {
            var ataskmanagerid = $(this).closest('li').data('id');

            e.preventDefault();
            $.post(ataskmanager_ajax_vars.url, {
                nonce: ataskmanager_ajax_vars.nonce,
                action: "ataskmanager_delete_task",
                ataskmanagerid: ataskmanagerid
            }, function (data) {

                if (data.success)
                {
                    ataskmanager_message('success', "Task deleted");
                    window.ataskmanager_updated = true;
                    ataskmanager_refresh_tasks();
                }

            });
        });
    }



    function ataskmanager_message(type, message)
    {

    }

    $("#wp-admin-bar-ataskmanager_top_item a").click(function (e) {


        e.preventDefault();
        var linkobject = this;

        if ($(this).hasClass('selected')) {
            ataskmanagerDeselect($(linkobject));
        } else {
            $(this).addClass('selected');
            ataskmanagerSetPosition('.ataskmanager_popup', linkobject);
            $('.ataskmanager_popup').slideFadeToggle();
        }


        ataskmanager_refresh_tasks();



    });


    $(".ataskmanager_popup_close > a").click(function (e) {
        e.preventDefault();

        var linkobject = $("#wp-admin-bar-ataskmanager_top_item a");
        if ($(this).hasClass('selected')) {
            ataskmanagerDeselect($(linkobject));
        } else {
            $(this).addClass('selected');
            ataskmanagerSetPosition('.ataskmanager_popup', linkobject);
            $('.ataskmanager_popup').slideFadeToggle();
        }

    })



    $("#ataskmanager_add_new_form, #ataskmanager_page_add_new_form").submit(function (e) {
        e.preventDefault();
        if ($(this).data('page'))
        {
            var newtask = $("#ataskmanager_page_new_task").val();
            $("#ataskmanager_page_new_task").val('');
        } else
        {
            var newtask = $("#ataskmanager_new_task").val();
            $("#ataskmanager_new_task").val('');
        }

        if (newtask)
        {
            $.post(ataskmanager_ajax_vars.url, {
                nonce: ataskmanager_ajax_vars.nonce,
                action: "ataskmanager_add_new_task",
                task_title: newtask
            }, function (data) {
                if (data.success)
                {
                    window.ataskmanager_updated = true;
                    ataskmanager_refresh_tasks();
                }

            });
        }

    });


    function ataskmanagerSetPosition(el, el_to)
    {
        var el2height = $(el_to).height();
        var el2offset = $(el_to).offset();
        var el2top = el2offset.top;
        var el2left = el2offset.left;

        var elTop = el2height + el2offset + 5;
        var windowsWidth = $(window).width();
        if (windowsWidth < 300)
        {
            elLeft = windowsWidth;
        } else if (el2left + 300 > $(window).width())
        {
            elLeft = $(window).width() - 300;
        } else
        {
            elLeft = el2left;
        }


        $(el).css('top', elTop + 'px');
        $(el).css('left', elLeft + 'px');




    }

    function ataskmanagerDeselect(e) {
        $('.ataskmanager_popup').slideFadeToggle(function () {
            e.removeClass('selected');
        });
    }

    $(function () {
        $('.ataskmanager_popup .close').on('click', function () {
            ataskmanagerDeselect($('#wp-admin-bar-ataskmanager_top_item a'));
            return false;
        });
    });

    $.fn.slideFadeToggle = function (easing, callback) {
        return this.animate({opacity: 'toggle', height: 'toggle'}, 'fast', easing, callback);
    };

})(jQuery);
