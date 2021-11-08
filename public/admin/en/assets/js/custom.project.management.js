
    
    /*============================================
    ** Add New Board Card
    ==============================================*/
    var boardComposer = $('.board-composer');
    var d = document;

    function addBoardCard(e) {
        e.preventDefault();
        var title = $(this).parents('form').children('textarea').val();
        var date = $(this).parents('.actions').siblings('.date').children('.date-text').text();
        
        // Check Title is Empty
        if( title != "" ) {
        
            var boardCard = d.createElement('div');
                boardCard.className = 'board-card';

            var p = d.createElement('p');
                p.className = 'black mb-2';
                p.textContent = title;
                boardCard.append(p);

            var infoBar = d.createElement('div');
                infoBar.className = 'd-flex justify-content-between align-items-center';

            var left = d.createElement('div');
                left.className = 'left d-flex align-items-center';
                left.innerHTML = '<img src="../../../assets/img/svg/watch.svg" alt="" class="svg mr-1">';

            var dateA = d.createElement('a');
                dateA.setAttribute('href', '#');
                dateA.className = 'text_color font-12';
                dateA.textContent = date;


                
                left.append(dateA)
                infoBar.append(left);
                boardCard.append(infoBar);

            var boardCards = $(this).parents('.board-composer').siblings('.board-cards');
                boardCards.append(boardCard);
        }
        // Textarea value reset
        $(this).parents('form').children('textarea').val(null);
    }
    
    if( boardComposer.length ) {

        boardComposer.find('.add-card').hide();

        // Add Another Card Click
        boardComposer.find('.add-another-card').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            boardComposer.find('.add-card').hide();
            boardComposer.find('.add-another-card').show();

            $(this).hide();
            $(this).siblings('.add-card').slideDown();
        });

        // Cancel Btn Click
        boardComposer.find('.add-card .cancel').on('click', function(e) {
            e.preventDefault();
            $(this).parents('.add-card').hide();
            $(this).parents('.add-card').siblings('.add-another-card').show();
        });

        // Save Btn Click
        boardComposer.find('.add-card .save').on('click', addBoardCard);

        // Add Card Click
        $('.add-card').on('click', function(e) {
            e.stopPropagation();
        });

        // Body Click
        $('body').on('click', function(e) {
            boardComposer.find('.add-card').hide();
            boardComposer.find('.add-another-card').show();
        });
    }

    /*============================================
    ** Add New Board List
    ==============================================*/
    var addAnotherList = $('.add-card.add-another-list');

    // IE Support
    (function (arr) {
        arr.forEach(function (item) {
          if (item.hasOwnProperty('append')) {
            return;
          }
          Object.defineProperty(item, 'append', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function append() {
              var argArr = Array.prototype.slice.call(arguments),
                docFrag = document.createDocumentFragment();
              
              argArr.forEach(function (argItem) {
                var isNode = argItem instanceof Node;
                docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
              });
              
              this.appendChild(docFrag);
            }
          });
        });
    })([Element.prototype, Document.prototype, DocumentFragment.prototype]);


    // Set Multiple Attributes
    function setAttributes(el, attrs) {
        for(var key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    }

    function addList(e) {

        // If press Enter key
        if( e.keyCode === 13 ) {
            e.preventDefault();
            
            // Check value
            if( $(this).val() ) {
                //Create Board Header
                var board = d.createElement('div');
                setAttributes(board, {"class": "board"});

                var boardHeader = d.createElement('div');
                setAttributes(boardHeader, {"class": "board-header d-flex justify-content-between align-items-center mb-10"});

                var h4 = d.createElement('h4');
                setAttributes(h4, {"class": "c2"});
                h4.textContent = $(this).val();
                boardHeader.append(h4);


                var dropdownBtn = d.createElement('div');
                setAttributes(dropdownBtn, {"class": "dropdown-button"});

                var dropdownBtnA = d.createElement('a');
                setAttributes(dropdownBtnA, {"src": "#", "data-toggle": "dropdown", "class": "d-flex align-items-center", "style": "cursor: pointer"});


                var dropdownIcon = d.createElement('div');
                setAttributes(dropdownIcon, {"class": "menu-icon justify-content-center style--two mr-0"});

                for( var i = 0; i < 3; i++ ) {
                    var span = d.createElement('span');
                    dropdownIcon.append(span)
                }

                dropdownBtnA.append(dropdownIcon);
                dropdownBtn.append(dropdownBtnA);

                var dropdownMenu = d.createElement('div');
                setAttributes(dropdownMenu, {"class": "dropdown-menu dropdown-menu-right"});

                var menuText = ["Daily", "Sort By", "monthly"];
                for ( var i = 0; i < menuText.length; i++ ) {
                    var dpmenuA = d.createElement('a');
                        dpmenuA.textContent = menuText[i];
                        setAttributes(dpmenuA, {"src": "#"});
                        dropdownMenu.append(dpmenuA)
                }
                
                dropdownBtn.append(dropdownMenu);
                boardHeader.append(dropdownBtn);

                //Create Board Cards
                var bordCards = d.createElement('div');
                    bordCards.className = 'board-cards';


                // Create Board Composer
                var boardCompose = d.createElement('div');
                    setAttributes(boardCompose, {"class": "board-composer flex-column d-flex align-items-center justify-content-center"});


                var addAnotherCard = d.createElement('a');
                setAttributes(addAnotherCard, { "href": "#", "class": "add-another-card" });
                addAnotherCard.innerHTML = '<img src="../../../assets/img/svg/plus.svg" alt="" class="svg mr-1">';

                var addAnotherCardSpan = d.createElement('span');
                addAnotherCardSpan.textContent = 'Add another card';
                setAttributes(addAnotherCardSpan, { "class": "font-14 bold c4" });
                addAnotherCard.append(addAnotherCardSpan);
                boardCompose.append(addAnotherCard);


                var addCard = d.createElement('div');
                setAttributes(addCard, { "class": "add-card w-100" });

                var form = d.createElement('form');
                setAttributes(form, { "action": "#" });

                var textarea = d.createElement('textarea');
                setAttributes(textarea, { "placeholder": "List Title", "class": "theme-input-style style--five", "value": "title" });
                form.append(textarea)

                var dateActionWrap = d.createElement('div');
                setAttributes(dateActionWrap, { "class": "d-flex align-items-center justify-content-between mt-2" });

                var date = d.createElement('div');
                setAttributes(date, { "class": "date d-flex align-items-center" });
                date.innerHTML = '<img src="../../../assets/img/svg/watch.svg" alt="" class="svg mr-1">';

                var addCardSpan = d.createElement('span');

                // Set current Date & Month
                var day = new Date().toLocaleDateString('en-US', { day: 'numeric' });
                var month = new Date().toLocaleDateString('en-US', { month: 'long' });
                addCardSpan.textContent = day + " " + month;
                
                setAttributes(addCardSpan, { "class": "date-text" });
                date.append(addCardSpan);
                dateActionWrap.append(date);

                var actions = d.createElement('div');
                setAttributes(actions, { "class": "actions" });

                var cancelA = d.createElement('a');
                cancelA.textContent = 'Cancel';
                setAttributes(cancelA, { "href": "#", "class": "cancel font-14 bold mr-3" });
                actions.append(cancelA);

                var saveA = d.createElement('a');
                saveA.textContent = 'Save';
                setAttributes(saveA, { "href": "#", "class": "btn save" });
                saveA.addEventListener('click', addBoardCard);
                saveA.addEventListener('click', dragDrop);
                actions.append(saveA);


                dateActionWrap.append(actions);
                form.append(dateActionWrap);
                addCard.append(form);
                boardCompose.append(addCard);


                // Append Board Composer to Board
                board.append(boardHeader, bordCards, boardCompose);

                $('.board-wrapper .board:last').before(board);
                $(this).val(null);



                //Board Compose
                $(boardCompose).find('.add-card').hide();

                //Add Another Card click actions
                $(document).find('.add-another-card').on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $(document).find('.add-card').hide();
                    $(document).find('.add-another-card').show();

                    $(this).hide();
                    $(this).siblings('.add-card').slideDown();
                });

                //Cancel btn click action
                boardCompose.querySelector('.add-card .cancel').addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    $(this).parents('.add-card').hide();
                    $(this).parents('.add-card').siblings('.add-another-card').show();
                });

                // Add Card Click
                $('.add-card').on('click', function(e) {
                    e.stopPropagation();
                });
        
                // Body Click
                $('body').on('click', function(e) {
                    $(this).find('.add-card').hide();
                    $(this).find('.add-another-card').show();
                });
            }
        }
    }
    addAnotherList.find('form input').on('keypress', addList);


    /*============================================
    ** Drag Board Card
    ==============================================*/
    function dragDrop() {
        $( document ).find( ".board-cards" ).sortable({
          connectWith: ".board-cards"
        }).disableSelection();
    }
    dragDrop();

    /*============================================
    ** Click and Drag
    ==============================================*/
    var slider = document.querySelector(".board-wrapper");
    var isDown = false;
    var startX;
    var scrollLeft;

    // Mousedown
    slider.addEventListener("mousedown", function(e) {
        if(e.target !== this) return;

        isDown = true;
        slider.classList.add("active");
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    // Mouseleave
    slider.addEventListener("mouseleave", function() {
        isDown = false;
        slider.classList.remove("active");
    });

    // Mouseup
    slider.addEventListener("mouseup", function() {
        isDown = false;
        slider.classList.remove("active");
    });

    // Mousemove
    slider.addEventListener("mousemove", function(e) {
        if(!isDown) return; //stop the function from the running
        var x = e.pageX - slider.offsetLeft;
        var walk = (x - startX) * 1;
        slider.scrollLeft = scrollLeft - walk;
    });

    /*============================================
    ** Contact PopUp Add Avatar
    ==============================================*/
    $( '.board-members-list' ).find('.member-item').on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass('active');
    });

    $( '.board-members-list' ).find('.member-item').on('mouseenter', function(e) {
        $( '.board-members-list' ).find('.member-item').removeClass('selected');
        $(this).addClass('selected');
    });
    

    $('.board-card').on('click', function() {
        $('#projectTaskDetails').modal('show')
    });

    /*============================================
    ** Project Main Title edit Option
    ==============================================*/
    var titleTextarea = $('#projectTaskDetails').find('.project-main-title textarea');

    $('#projectTaskDetails').find('.project-main-title h4').on('click', function(e) {
        e.stopPropagation();
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, .checklist-add-control-wrap').hide();


        var textarea = $(this).siblings('textarea');
        var height = $(this).height() + 10 + 'px';
        
        textarea.val($(this).text()).addClass('isEditing').css('height', height);
    });

    titleTextarea.on('keypress', function(e) {
        if(e.keyCode == 13) {
            
            e.preventDefault();
            $(this).removeClass('isEditing').siblings('h4').text($(this).val());
        }
    });

    $(document).on('click', 'body', function(e) {
        if(titleTextarea.hasClass('isEditing')) {
            
            titleTextarea.siblings('h4').text(titleTextarea.val());
            titleTextarea.removeClass('isEditing');
        }
    });

    titleTextarea.on('click', function(e) {
        e.stopPropagation();
    });


    /*============================================
    ** Project Main Description edit Option
    ==============================================*/
    var projectDes = $('#projectTaskDetails').find('.project-description');
        projectDes.find('.des-edit-actions').hide();

    projectDes.find('.description').on('click', function(e) {
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, .checklist-add-control-wrap').hide();
        titleTextarea.removeClass('isEditing');

        var desText = $(this);

        $(this).addClass('edit').siblings('.des-edit-actions').show().children('textarea').text(desText.text()).css('height', desText.height() + 8 + 'px');

    });

    projectDes.find('.des-edit-controls .des-save').on('click', function(e) {
        var textareaVal = $(this).parents('.des-edit-controls').siblings('textarea').val();
        $(this).parents('.des-edit-actions').siblings('.description').text(textareaVal);
    });

    projectDes.find('.des-edit-controls .icon-close, .des-edit-controls .des-save').on('click', function(e) {
        $(this).parents('.des-edit-actions').siblings('.description').removeClass('edit');
        $(this).parents('.des-edit-actions').hide();
    });


    /*============================================
    ** Comment Delete
    ==============================================*/
    var commentContent = $('#projectTaskDetails').find('.comment-content');
        commentContent.find('.edit-actions').hide()

    commentContent.find('.comment-action-delete').on('click', function(e) {
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, .checklist-add-control-wrap').hide();
        titleTextarea.removeClass('isEditing');

        $(this).parents('.comment').remove();
    });


    /*============================================
    ** Comment Edit
    ==============================================*/
    commentContent.find('.comment-action-edit').on('click', function(e) {
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, .checklist-add-control-wrap').hide();
        titleTextarea.removeClass('isEditing');

        var commentText = $(this).parents('.comment-action-links').siblings('.comment-edit').children('.comment-text');
        $(this).parents('.comment-action-links').siblings('.comment-edit').addClass('mb-5').children('.edit-actions').show().children('textarea').text(commentText.text()).css('height', commentText.height() + 5 + 'px');
    });

    commentContent.find('.comment-edit .comment-save').on('click', function(e) {
        var textareaVal = $(this).parents('.edit-actions').children('textarea').val();
        $(this).parents('.edit-actions').siblings('.comment-text').text(textareaVal);
    });

    commentContent.find('.comment-edit .icon-close, .comment-edit .comment-save').on('click', function(e) {
        $(this).parents('.comment-edit').removeClass('mb-5').children('.edit-actions').hide();
    });


    /*============================================
    ** Projects Popups
    ==============================================*/
    // Board Members list toggle class
    $( '.board-members-list' ).find('.member-item').on('click', function(e) {
        $(this).toggleClass('active');
    });

    // Boards Members list hover effect
    $( '.board-members-list' ).find('.member-item').on('mouseenter', function(e) {
        $( '.board-members-list' ).find('.member-item').removeClass('selected');
        $(this).addClass('selected');
    });

    // Board Labels list toggle class
    $( '.board-labels-list' ).find('.label-item .label').on('click', function(e) {
        e.preventDefault();
        $(this).parent('.label-item').toggleClass('active');
    });

    // Board Labels list hover effect
    $( '.board-labels-list, .board-labels-select-color' ).find('.label-item .label').on('mouseenter', function(e) {
        $( '.board-labels-list' ).find('.label-item').removeClass('selected');
        $(this).parent('.label-item').addClass('selected');
    });
    
    // Boards Labels Select color add & remove class
    $( '.board-labels-select-color, .edit-labels-no-color' ).find('.label-item .label').on('click', function(e) {
        $( '.board-labels-select-color, .edit-labels-no-color' ).find('.label-item').removeClass('active');
        $(this).parent('.label-item').addClass('active');
    });
    
    // Due Date Picker due btn
    $( '.change-card-btns .change-card-due-date, #default-date2' ).on('click', function (e) {
        e.preventDefault();
        $( '.change-card-btns .change-card-due-date' ).datepicker();
    });

    function addNewLabel() {
        var boardLabelsList = $( '#projectLabelModal' ).find( '.board-labels-list' );
        var createLabelName = d.querySelector( '#createLabelName' );

        var labelItem = d.createElement('li');
            labelItem.className = 'label-item d-flex align-items-center mb-1';

        var labelId = $('.board-labels-select-color, .edit-labels-no-color').find('.label-item.active > .label').attr('id');
        var labelClass = $('.board-labels-select-color, .edit-labels-no-color').find('.label-item.active > .label').attr('class');
        var label = d.createElement('span');
            label.className = 'mr-1 ' + labelClass;
            label.setAttribute('id', labelId);
            label.textContent = createLabelName.value;

        var labelSpan = d.createElement('span');
            labelSpan.className = 'icon-check checked-icon';
            label.append(labelSpan);

        var editLabel = d.createElement('a');
            editLabel.className = 'edit-label d-flex align-items-center p-2';
            editLabel.setAttribute('href', '#');
            editLabel.innerHTML = '<i class="icofont-ui-edit"></i>';


        labelItem.append(label, editLabel);
        boardLabelsList.append(labelItem)

        createLabelName.value = '';
    }

    // Main Label Hide
    $( '#projectLabelModal' ).find( '.create-new-label' ).on('click', function(e) {
        e.preventDefault();
        $( '#projectLabelModal' ).find( '.modal-content.main-labels' ).hide();
        $( '#projectLabelModal' ).find( '.modal-content.add-labels' ).show();
    });

    //Back Main Label
    $( '#projectLabelModal' ).find( '.modal-header .back-btn' ).on('click', function(e) {
        e.preventDefault();
        $( '#projectLabelModal' ).find( '.modal-content.main-labels' ).show();
        $( '#projectLabelModal' ).find( '.modal-content.add-labels' ).hide();
    });

    // Create New Label
    $( '#projectLabelModal' ).find( '.create-label-btn' ).on('click', function(e) {
        e.preventDefault();
        $( '#projectLabelModal' ).find( '.modal-content.main-labels' ).show();
        $( '#projectLabelModal' ).find( '.modal-content.add-labels' ).hide();
        
        addNewLabel();
    });

    //Specific Label Edit
    $( '#projectLabelModal' ).find( '.label-item .edit-label' ).on('click', function(e) {
        e.preventDefault();
        $( '#projectLabelModal' ).find( '.modal-content.main-labels' ).hide();
        $( '#projectLabelModal' ).find( '.modal-content.add-labels' ).show();
        
        $( '.board-labels-select-color' ).find( '.label-item .label' ).each( (i, ele) => {
            
            if($(this).siblings('.label').attr('id') == ele.id) {
                $( '.board-labels-select-color, .edit-labels-no-color' ).find( '.label-item' ).removeClass('active');
                ele.parentNode.classList.add('active'); 
            }
        });
    });
    

    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    // Member Add btn
    $('.member .btn-circle, .change-card-btns .change-card-member').on('click', function(e) {
        e.stopPropagation();
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, .checklist-add-control-wrap').hide();
        titleTextarea.removeClass('isEditing');
        $('.checklist-add-control-wrap').siblings('.add-item-btn').show();

        var coords = this.getBoundingClientRect();
        var projectMemberModal = $('#projectMemberModal');
        
        
        
        if($(window).width() < 1024 &&  $(window).width() > 767) {
            projectMemberModal.css({
                'left': coords.left + window.scrollX - 144,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        } else if($(window).width() < 767) {
            projectMemberModal.css({
                'left': '50%',
                'transform': 'translateX(-50%)',
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        } else {
            projectMemberModal.css({
                'left': coords.left + window.scrollX,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        }

        if(isIE) {
            projectMemberModal.css({
                'left': (e.pageX - e.target.clientWidth) + (window.scrollX ?  window.scrollX : 0),
                'top': (e.pageY + e.target.clientHeight) + (window.scrollY ?  window.scrollY : 0)
            });
        }
    });

    
    // Member Add btn For Task Header
    $('.member .btn-circle.task-header').on('click', function(e) {
            e.stopPropagation();
    
            var coords = this.getBoundingClientRect();
            var projectMemberModal = $('#projectMemberModal');
            
            
            if($(window).width() < 1024 &&  $(window).width() > 767) {
                projectMemberModal.css({
                    'left': coords.left + window.scrollX - 144,
                    'top': coords.top + coords.height + window.scrollY,
                    'display': 'block'
                });
            } else if($(window).width() < 767) {
                projectMemberModal.css({
                    'left': '50%',
                    'transform': 'translateX(-50%)',
                    'top': coords.top + coords.height + window.scrollY,
                    'display': 'block'
                });
            } else {
                projectMemberModal.css({
                    'left': coords.left + window.scrollX - (projectMemberModal.width() - 38),
                    'top': coords.top + coords.height + window.scrollY,
                    'display': 'block'
                });
            }
        });
    
    // Labels Add btn
    $(document).on('click', '#projectTaskDetails .add-label, #projectTaskDetails .change-card-label', function(e) {
        e.stopPropagation();
        let coords = this.getBoundingClientRect();
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, .checklist-add-control-wrap').hide();
        titleTextarea.removeClass('isEditing');
        $('.checklist-add-control-wrap').siblings('.add-item-btn').show();
        

        var projectLabelModal = $('#projectLabelModal');

        if($(window).width() < 1024 &&  $(window).width() > 767) {
            projectLabelModal.css({
                'left': coords.left + window.scrollX - 144,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        } else if($(window).width() < 767) {
            projectLabelModal.css({
                'left': '50%',
                'transform': 'translateX(-50%)',
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        } else {
            projectLabelModal.css({
                'left': coords.left + window.scrollX,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        }


        if(isIE) {
            projectLabelModal.css({
                'left': (e.pageX - e.target.clientWidth) + (window.scrollX ?  window.scrollX : 0),
                'top': (e.pageY + e.target.clientHeight) + (window.scrollY ?  window.scrollY : 0)
            });
        }
    });

    // Checklist Add btn
    $(document).on('click', '#projectTaskDetails .change-card-checklist', function(e) {
        e.stopPropagation();
        let coords = this.getBoundingClientRect();
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, .checklist-add-control-wrap').hide();
        titleTextarea.removeClass('isEditing');
        $('.checklist-add-control-wrap').siblings('.add-item-btn').show();

        var projectChecklistModal = $('#projectChecklistModal');

        if($(window).width() < 1024 &&  $(window).width() > 767) {
            projectChecklistModal.css({
                'left': coords.left + window.scrollX - 144,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        } else if($(window).width() < 767) {
            projectChecklistModal.css({
                'left': '50%',
                'transform': 'translateX(-50%)',
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        } else {
            projectChecklistModal.css({
                'left': coords.left + window.scrollX,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        }

        if(isIE) {
            projectChecklistModal.css({
                'left': (e.pageX - e.target.clientWidth) + (window.scrollX ?  window.scrollX : 0),
                'top': (e.pageY + e.target.clientHeight) + (window.scrollY ?  window.scrollY : 0)
            });
        }
    });

    // Move Add btn
    $(document).on('click', '#projectTaskDetails .change-card-move', function(e) {
        e.stopPropagation();
        let coords = this.getBoundingClientRect();
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, .checklist-add-control-wrap').hide();
        titleTextarea.removeClass('isEditing');


        var projectMoveModal = $('#projectMoveModal');

        if($(window).width() < 1024 &&  $(window).width() > 767) {
            projectMoveModal.css({
                'left': coords.left + window.scrollX - 144,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        } else if($(window).width() < 767) {
            projectMoveModal.css({
                'left': '50%',
                'transform': 'translateX(-50%)',
                'top': (coords.top + coords.height + window.scrollY) - (projectMoveModal.height() - 200),
                'display': 'block'
            });
        } else {
            projectMoveModal.css({
                'left': coords.left + window.scrollX,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        }



        if(isIE) {
            projectMoveModal.css({
                'left': (e.pageX - e.target.clientWidth) + (window.scrollX ?  window.scrollX : 0),
                'top': (e.pageY + e.target.clientHeight) + (window.scrollY ?  window.scrollY : 0)
            });
        }
    });

    // Copy Add btn
    $(document).on('click', '#projectTaskDetails .change-card-copy', function(e) {
        e.stopPropagation();
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, .checklist-add-control-wrap').hide();
        titleTextarea.removeClass('isEditing');
        
        var coords = this.getBoundingClientRect();
        var projectCopyModal = $('#projectCopyModal');

        if($(window).width() < 1024 &&  $(window).width() > 767) {
            projectCopyModal.css({
                'left': coords.left + window.scrollX - 144,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        } else if($(window).width() < 767) {
            projectCopyModal.css({
                'left': '50%',
                'transform': 'translateX(-50%)',
                'top': (coords.top + coords.height + window.scrollY) - (projectCopyModal.height() - 160),
                'display': 'block'
            });
        } else {
            projectCopyModal.css({
                'left': coords.left + window.scrollX,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        }

        if(isIE) {
            projectCopyModal.css({
                'left': (e.pageX - e.target.clientWidth) + (window.scrollX ?  window.scrollX : 0),
                'top': (e.pageY + e.target.clientHeight) + (window.scrollY ?  window.scrollY : 0)
            });
        }
    });

    // Share btn
    $(document).on('click', '#projectTaskDetails .change-card-share', function(e) {
        e.stopPropagation();
        let coords = this.getBoundingClientRect();
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, .checklist-add-control-wrap').hide();
        titleTextarea.removeClass('isEditing');
        $('.dropdown-menu.checkbox2').removeClass('show');
        
        var projectShareModal = $('#projectShareModal');
        

        if($(window).width() < 1024 &&  $(window).width() > 767) {
            projectShareModal.css({
                'left': coords.left + window.scrollX - 144,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        } else if($(window).width() < 767) {
            projectShareModal.css({
                'left': '50%',
                'transform': 'translateX(-50%)',
                'top': (coords.top + coords.height + window.scrollY) - projectShareModal.height(),
                'display': 'block'
            });
        } else {
            projectShareModal.css({
                'left': coords.left + window.scrollX,
                'top': coords.top + coords.height + window.scrollY,
                'display': 'block'
            });
        }


        if(isIE) {
            projectShareModal.css({
                'left': (e.pageX - e.target.clientWidth) + (window.scrollX ?  window.scrollX : 0),
                'top': (e.pageY + e.target.clientHeight) + (window.scrollY ?  window.scrollY : 0)
            });
        }
    });


    // body click
    $(document).on('click', 'body', function(e) {
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, .checklist-add-control-wrap').hide();
        $('.dropdown-menu.checkbox2').removeClass('show');
        $('.checklist-add-control-wrap').siblings('.add-item-btn').show();
    });

    // stop propagation
    $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, #projectShareModal, #projectTaskDetails .checklist-new-item').on('click', function(e) {
        $('.dropdown-menu.checkbox2').removeClass('show');
        e.stopPropagation();
    });

    // Popup Close
    $('#projectMemberModal .modal-close, #projectMoveModal .modal-close, #projectCopyModal .modal-close, #projectLabelModal .modal-close, #projectShareModal .modal-close, #projectChecklistModal .modal-close, #projectTaskDetails .add-item-btn').on('click', function() {
        $('#projectMemberModal, #projectLabelModal, #projectShareModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, .checklist-add-control-wrap').hide();
        $('.dropdown-menu.checkbox2').removeClass('show');
    });

    
    /*============================================
    ** Attachment Close
    ==============================================*/
    $('#projectTaskDetails').find('.attachment-close').on('click', function() {
        $(this).parents('.attachment').remove();
    });

    /*============================================
    ** Checklist
    ==============================================*/
    // Add checklist Element Function
    function addChecklistEle(ele, checklistItemText) {
        var checklistItemWrap = d.createElement('div');
            checklistItemWrap.className = 'checklist-item-wrap';
            ele.parents('.checklist-new-item').siblings('.checklist-items').append(checklistItemWrap);

            var posRelative = d.createElement('div');
                posRelative.className = 'checklist-item-details position-relative d-flex justify-content-between';
                checklistItemWrap.append(posRelative);

                var customCheckbox = d.createElement('label');
                    customCheckbox.className = 'custom-checkbox style--three';

                    var input = d.createElement('input');
                        input.setAttribute('type', 'checkbox');

                    var checkmark = d.createElement('span');
                        checkmark.className = 'checkmark';
                        customCheckbox.append(input, checkmark);

                var checklistItem = d.createElement('span');
                    checklistItem.className = 'checklist-item';
                    checklistItem.textContent = checklistItemText.val();

                var iconDelete = d.createElement('span');
                    iconDelete.className = 'icon-delete font-12';
                    iconDelete.innerHTML = '<i class="icofont-trash"></i>';
                    iconDelete.addEventListener('click', function() {
                        $(this).parents('.checklist-item-wrap').remove();
                    });

                posRelative.append(customCheckbox, checklistItem, iconDelete);
                checklistItemText.val(null);
    }

    // Add checklist Item Function
    function addChecklistItem(e) {
        e.preventDefault();
        var checklistItemText = $(this).parents('.checklist-add-controls').siblings('textarea');
        
        if(checklistItemText.val() != '') {
            addChecklistEle($(this), checklistItemText);
        }
    }

    // Add checklist Function
    function addChecklist(e) {
        e.preventDefault();
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, .checklist-add-control-wrap').hide();

        var checklists = d.querySelector('#projectTaskDetailsMain .checklists');
            
        let inputValue = $(this).siblings('form').children('input');

        if(inputValue.val() != '') {
            var checklist = d.createElement('div');
                checklist.className = 'checklist pb-4';
                checklists.append(checklist);

                //ProcessBar Wrapper
                var processBarWrap = d.createElement('div');
                    processBarWrap.className = 'process-bar-wrapper';

                    var processName = d.createElement('span');
                        processName.className = 'process-name';
                        processName.textContent = inputValue.val();

                    var processWidth = d.createElement('span');
                        processWidth.className = 'process-width';
                        processWidth.textContent = '0%';

                    var actionBtns = d.createElement('div');
                        actionBtns.className = 'action-btns';

                        var hideBtn = d.createElement('span');
                            hideBtn.className = 'hide-completed-item light-btn d-none';
                            hideBtn.textContent = 'Hide Completed Items';

                        var deleteBtn = d.createElement('span');
                            deleteBtn.className = 'delete-btn light-btn';
                            deleteBtn.textContent = 'Delete';
                            deleteBtn.addEventListener('click', function() {
                                $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, .checklist-add-control-wrap').hide();
                                $(this).parents('.checklist').remove();
                            });
                            actionBtns.append(hideBtn, deleteBtn);

                    var processBar = d.createElement('span');
                        processBar.className = 'process-bar';
                        processBar.setAttribute('data-process-width', '33');
                processBarWrap.append(processName, processWidth, actionBtns, processBar);


                // Checklist Items
                var checklistItems = d.createElement('div');
                    checklistItems.className = 'checklist-items';


                // Checklist New Items
                var checklistNewItem = d.createElement('div');
                    checklistNewItem.className = 'checklist-new-item ml-35';
                    checklistNewItem.addEventListener('click', function(e) {
                        e.stopPropagation()
                    })

                    var addItemBtn = d.createElement('a');
                        addItemBtn.className = 'light-btn add-item-btn';
                        addItemBtn.textContent = 'Add An Item';
                        addItemBtn.setAttribute('href', '#');
                        addItemBtn.addEventListener('click', function(e) {
                            $(this).hide().siblings('.checklist-add-control-wrap').show();
                        });

                    var checklistAddControlWrap = d.createElement('div');
                        checklistAddControlWrap.className = 'checklist-add-control-wrap';

                        var textarea = d.createElement('textarea');
                            textarea.className = 'theme-input-style';
                            textarea.setAttribute('placeholder', 'Add an Item');
                            textarea.addEventListener('keypress', function(e) {
                                if(e.keyCode === 13) {
                                    e.preventDefault();
                                    var ele = $(this);
                                    
                                    if(ele.val() != '') {
                                        addChecklistEle(ele, ele);
                                    }
                                }
                            });


                        var checklistAddControls = d.createElement('div');
                            checklistAddControls.className = 'checklist-add-controls d-flex align-items-center';
                            
                            var addChecklistItemBtn = d.createElement('a');
                                addChecklistItemBtn.className = 'light-btn add-checklist-item c2-bg';
                                addChecklistItemBtn.setAttribute('href', '#');
                                addChecklistItemBtn.textContent = 'Add';
                                addChecklistItemBtn.addEventListener('click', addChecklistItem);

                            var iconClose = d.createElement('a');  
                                iconClose.className = 'icon-close ml-2';
                                iconClose.innerHTML = '<i class="icofont-close-line"></i>';
                                iconClose.addEventListener('click', function(e) {
                                    e.preventDefault();
                                    $(this).parents('.checklist-add-control-wrap').hide();
                                    $(this).parents('.checklist-add-control-wrap').siblings('.add-item-btn').show();
                                })


                            checklistAddControls.append(addChecklistItemBtn, iconClose);
                        checklistAddControlWrap.append(textarea, checklistAddControls);
                    checklistNewItem.append(addItemBtn, checklistAddControlWrap);
            checklist.append(processBarWrap, checklistItems, checklistNewItem);

        }
        inputValue.val('Checklist')
    }

    $('#projectChecklistModal').find('.add-checklist-btn').on('click', addChecklist );
    $('#projectTaskDetails').find('.add-checklist-item').on('click', addChecklistItem );

    $('#projectTaskDetails').find('.icon-delete').on('click', function() {
        $(this).parents('.checklist-item-wrap').remove();
    });

    // Checklist Item Delete
    $('#projectTaskDetails').find('.action-btns .delete-btn').on('click', function() {
        $('#projectMemberModal, #projectLabelModal, #projectChecklistModal, #projectMoveModal, #projectCopyModal, .checklist-add-control-wrap').hide();
        $(this).parents('.checklist').remove();
    });

    // Textarea Keypress Event
    $('#projectTaskDetails').find('.checklist-new-item textarea').on('keypress', function(e) {
        if(e.keyCode === 13) {
            e.preventDefault();
            var checklistItemText = $(this);
            
            if(checklistItemText.val() != '') {
                addChecklistEle(checklistItemText, checklistItemText);
            }
        }
    });

    // popup close icon click
    $('#projectTaskDetails').find('.checklist-new-item').on('click', '.icon-close', function(e) {
        e.preventDefault();
        $(this).parents('.checklist-add-control-wrap').hide();
        $(this).parents('.checklist-add-control-wrap').siblings('.add-item-btn').show();
    });

    // Add Item
    $('#projectTaskDetails').find('.checklist-new-item').on('click', '.add-item-btn', function(e) {
        e.preventDefault();
        $(this).hide();
        $(this).siblings('.checklist-add-control-wrap').show();
    });