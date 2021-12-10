export const cc_basic_style = (plugin) => { 
  return `
            .chefcookie, .chefcookie *
            {
                box-sizing: border-box;
                margin:0;
                padding:0;
            }
            /* try to reset styles */
            .chefcookie h2,
            .chefcookie a:link, a:hover, a:visited
            {
                color:inherit;
            }
            .chefcookie
            {
                position: fixed;
                z-index: 2147483647;
                left: 0;
                right: 0;
                bottom: 0;
                transform: translateZ(0);             
            }
            .chefcookie--hidden
            {
                opacity: 0;
                pointer-events:none;
            }
            .chefcookie__inner
            {
                width:100%;
                height:100%;
                text-align: center;
                white-space: nowrap;
                font-size: 0;
                overflow-y:auto;
                overflow-x:hidden;
                max-height:100vh;
            }
            .chefcookie__box
            {
                font-size: ${15 + (plugin.config.style.size - 3)}px;
                line-height:1.6;
                color:${plugin.config.style.color_text ?? '#595f60'};
                width: 100%;
                margin: 0 auto;
                display: inline-block;
                vertical-align: middle;
                white-space: normal;
                border-radius: 0;
                padding-top: 2em;
                padding-bottom: 2em;
                padding-left: 3em;
                padding-right: 3em;
                text-align: left;
            }
            .chefcookie__message
            {
                margin-bottom:1.5em;
                text-align:justify;
            }
            .chefcookie__message h2
            {
                margin-bottom:0.5em;
                font-size:2em;
                line-height:1.4;
                text-transform:uppercase;
                font-weight:700;
                text-align:left;
            }
            .chefcookie__message p {
                font-size: 1em;
                line-height:1.6;
            }
            .chefcookie__message a,
            .chefcookie__message a:focus
            {
                color:inherit;
                transition: all ${plugin.animationSpeed / 1000}s ease-in-out;
                text-decoration:underline;
                font-size: 1em;
                line-height:1.6;
            }
            .chefcookie__message a:focus
            {
                outline:none;
            }
            @media (hover: hover) {
            .chefcookie__message a:hover
            {
                opacity: 0.5;
                color: inherit;
            }
            }
            .chefcookie__message a:active
            {
                opacity: 0.1;
                color: inherit;
            }
            .chefcookie__buttons
            {
                margin-top:0.5em;
            }
            .chefcookie__button,
            .chefcookie__button:focus
            {
                padding: 1em 0.5em;
                border: 2px solid ${plugin.config.style.color_text ?? '#595f60'};
                font-weight: bold;
                display: block;
                color: inherit;
                text-decoration: none;
                transition: all ${plugin.animationSpeed / 1000}s ease-in-out;
                text-transform: uppercase;
                float: left;
                text-align: center;
                min-width: 21em;
                margin-right:3em;
            }
            .chefcookie__buttons--count-3 .chefcookie__button,
            .chefcookie__buttons--count-3 .chefcookie__button:focus {
                min-width:15rem;
                margin-right:1em;
            }
            .chefcookie__button:last-child
            {
                margin-right:0;
            }
            .chefcookie__button:focus
            {
                outline:none;
            }
            @media (hover: hover) {
            .chefcookie__button:hover
            {
                opacity: 0.5;
                text-decoration:none;
                color: inherit;
            }
            }
            .chefcookie__button:active
            {
                opacity: 0.1;
                color: inherit;
            }
            .chefcookie__buttons:after
            {            
                clear:both;
                display:table;
                content:"";
            }
            ${
                plugin.config.style.highlight_accept === undefined || plugin.config.style.highlight_accept === true
                    ? `
            .chefcookie__button--accept
            {                
                background-color:${plugin.config.style.color_highlight ?? plugin.config.style.color ?? '#ff0000'};
                border-color:transparent;
            }
            .chefcookie__button--accept.chefcookie__button--accept,
            .chefcookie__button--accept.chefcookie__button--accept:hover,
            .chefcookie__button--accept.chefcookie__button--accept:focus,
            .chefcookie__button--accept.chefcookie__button--accept:link,
            .chefcookie__button--accept.chefcookie__button--accept:visited
            {
                color:${plugin.config.style.color_background ?? '#eeeeee'};
            }
                `
                    : ``
            }
            .chefcookie__settings-container
            {
                height:0;
                overflow:hidden;
                transition: height ${plugin.animationSpeed / 1000}s ease-out;
            }
            .chefcookie__groups
            {
                list-style-type:none;
            }
            .chefcookie__groups:after
            {
                clear:both;
                display:table;
                content:"";
            }
            .chefcookie__group
            {
                float: left;
            }
            .chefcookie__group-title
            {
                float:left;
                width:70%;
                min-height: 1.66em;
                line-height: 1.66;
                display: block;
                font-weight:bold;
                font-size:1.2em;
                line-height:1.7;
                text-transform:uppercase;
            }
            .chefcookie__group-label
            {
                cursor: pointer;
                display:block;
                width:100%;
                height:100%;
                font-size:1em;
                line-height:1.6;
            }
            .chefcookie__group-label:after
            {
                clear:both;
                display:table;
                content:""
            }
            .chefcookie__group--disabled .chefcookie__group-label
            {
                cursor:default;
            }
            .chefcookie__group-checkbox
            {
                opacity: 0;
                position:absolute;
                display: block;
                pointer-events:none;
            }
            .chefcookie__group--disabled .chefcookie__group-checkbox-icon
            {
            ${
                plugin.config.style.show_disabled_checkbox === undefined ||
                plugin.config.style.show_disabled_checkbox === false
                    ? `display:none;`
                    : `opacity: 0.75 !important;`
            }
            }
            .chefcookie__group-checkbox-icon
            {
                line-height:2;
                display: block;
                width: 4em;
                height: 2em;
                background-color: ${plugin.config.style.color_background ?? '#eeeeee'};
                border: 2px solid ${plugin.config.style.color_text ?? '#595f60'};
                margin: 0;
                padding: 0;
                position: relative;
                border-radius: 2em;
                float: right;
            }
            .chefcookie__group-checkbox-icon:before
            {
                content: "0";
                position: absolute;
                top: 0;
                left: 45%;
                width: 50%;
                bottom: 0;
                transition: all ${plugin.animationSpeed / 1000}s ease-in-out;
                text-align: center;
                font-weight: bold;
                font-size: 1em;                
                line-height: 2;
                opacity: 0.25;
                color: ${plugin.config.style.color_text ?? '#595f60'};
            }
            .chefcookie__group-checkbox-icon:after
            {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 50%;
                bottom: 0;
                box-shadow: 0 0 0px 1px ${plugin.config.style.color_text ?? '#595f60'};
                background-color: ${plugin.config.style.color_text ?? '#595f60'};
                transition: all ${plugin.animationSpeed / 1000}s ease-in-out;
                border-radius: 50%;
            }
            .chefcookie__group-checkbox ~ *
            {                
                transition: all ${plugin.animationSpeed / 1000}s ease-in-out;
            }
            .chefcookie__group-checkbox[data-status="0"] ~ *
            {
                opacity: 0.75;
            }
            .chefcookie__group-checkbox[data-status="1"] ~ .chefcookie__group-checkbox-icon
            {
                opacity: 0.85;
            }
            .chefcookie__group-checkbox[data-status="1"] ~ .chefcookie__group-checkbox-icon:after
            {
                left:25%;
            }
            .chefcookie__group-checkbox[data-status="2"] ~ .chefcookie__group-checkbox-icon:after
            {
                left:50%;
            }
            .chefcookie__group-checkbox[data-status="1"] ~ .chefcookie__group-checkbox-icon:before,
            .chefcookie__group-checkbox[data-status="2"] ~ .chefcookie__group-checkbox-icon:before
            {
                content: "";
                background-color: ${plugin.config.style.color_text ?? '#595f60'};
                top: 30%;
                bottom: 30%;
                left: 27%;
                width: 3px;
            }
            .chefcookie__group-description
            {
                width:100%;
                clear:both;
                padding-top:1em;
                display: block;
                font-size:0.9em;
                line-height:1.5;
                text-align:justify;
                font-weight: normal;
            }
            .chefcookie__group-collapse,
            .chefcookie__group-collapse:focus {
                color:inherit;
                text-decoration:underline;
                padding-top: 0.5em;
                display: block;
            }
            @media (hover: hover) {
            .chefcookie__group-collapse:hover
            {
                opacity: 0.9;
                color: inherit;
                text-decoration:underline;
            }
            }
            .chefcookie__scripts
            {
                list-style-type:none;
                height:0;
                overflow:hidden;
                transition: height ${plugin.animationSpeed / 1000}s ease-out;
            }
            .chefcookie__scripts--visible {
                height:auto;
            }
            .chefcookie__script {
                margin-bottom:0.5em;
            }
            .chefcookie__script:first-child {
                margin-top:1em;
            }
            .chefcookie__script:last-child {
                margin-bottom:0;
            }
            .chefcookie__script-title
            {
                float:left;
                width:70%;
                min-height: 1.66em;
                line-height: 1.66;
                display: block;
            }
            .chefcookie__script-label
            {
                cursor: pointer;
                display:block;
                width:100%;
                height:100%;
            }
            .chefcookie__script-label:after
            {
                clear:both;
                display:table;
                content:""
            }
            .chefcookie__script--disabled .chefcookie__script-label
            {
                cursor:default;
            }
            .chefcookie__script-checkbox
            {
                opacity: 0;
                position:absolute;
                display: block;
                pointer-events:none;
            }
            .chefcookie__script--disabled .chefcookie__script-checkbox-icon
            {
            ${
                plugin.config.style.show_disabled_checkbox === undefined ||
                plugin.config.style.show_disabled_checkbox === false
                    ? `display:none;`
                    : `opacity: 0.75 !important;`
            }
            }
            .chefcookie__script-checkbox-icon
            {
                line-height:1.5;
                display: block;
                width: 3em;
                height: 1.5em;
                background-color: ${plugin.config.style.color_background ?? '#eeeeee'};
                border: 1px solid ${plugin.config.style.color_text ?? '#595f60'};
                margin: 0;
                padding: 0;
                position: relative;
                border-radius: 2em;
                float: right;
            }
            .chefcookie__script-checkbox-icon:before
            {
                content: "0";
                position: absolute;
                top: 0;
                left: 45%;
                width: 50%;
                bottom: 0;
                transition: all ${plugin.animationSpeed / 1000}s ease-in-out;
                text-align: center;
                font-size: 0.7em;
                line-height: 2;
                opacity: 0.25;
                color: ${plugin.config.style.color_text ?? '#595f60'};
            }
            .chefcookie__script-checkbox-icon:after
            {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 50%;
                bottom: 0;
                box-shadow: 0 0 0px 1px ${plugin.config.style.color_text ?? '#595f60'};
                background-color: ${plugin.config.style.color_text ?? '#595f60'};
                transition: all ${plugin.animationSpeed / 1000}s ease-in-out;
                border-radius: 50%;
            }
            .chefcookie__script-checkbox ~ *
            {
                opacity: 0.75;
                transition: all ${plugin.animationSpeed / 1000}s ease-in-out;
            }
            .chefcookie__script-checkbox:checked ~ *
            {
                opacity:1;
            }
            .chefcookie__script-checkbox:checked ~ .chefcookie__script-checkbox-icon:after
            {
                left:50%;
            }
            .chefcookie__script-checkbox:checked ~ .chefcookie__script-checkbox-icon:before
            {
                content: "";
                background-color: ${plugin.config.style.color_text ?? '#595f60'};
                top: 30%;
                bottom: 30%;
                left: 27%;
                width: 2px;
            }

            .chefcookie__script-description
            {
                width: 100%;
                clear: both;
                padding-top: 0.5em;
                padding-bottom: 0.5em;
                display: block;
                font-size: 0.8em;
                line-height:1.4;
                text-align: justify;
            }
            .chefcookie__script-description-collapse,
            .chefcookie__script-description-collapse:focus {
                color:inherit;
                text-decoration:underline;
                padding-top: 0.25em;
                padding-bottom: 0.5em;
                display: block;
            }
            @media (hover: hover) {
            .chefcookie__script-description-collapse:hover
            {
                opacity: 0.9;
                color: inherit;
                text-decoration:underline;
            }
            }
            .chefcookie__script-description-content {
                height:0;
                overflow:hidden;
                transition: height ${plugin.animationSpeed / 1000}s ease-out;
            }
            .chefcookie__script-description-content > *:not(:last-child) {
                margin-bottom:0.5em;
            }
            .chefcookie__script-description-content table {
                width:100%;
                border-collapse: collapse;
                table-layout: fixed;
            }
            .chefcookie__script-description-content table td {
                border:1px solid ${plugin.hexToRgbaStr(plugin.config.style.color_text ?? '#595f60', 0.1)};
                padding: 0.3em 0.5em;
                vertical-align:top;
            }

            .chefcookie--noscroll body
            {
                position:fixed;
                width: 100%;
                overflow:hidden;
            }
            .chefcookie--fade body:after,
            .chefcookie--blur body:after
            {
                content:"";
                position:fixed;
                z-index: 2147483644;
                top:0;
                left:0;
                width:100%;
                height:100%;
            }
            .chefcookie--fade body:after
            {
                background-color: rgba(0, 0, 0, 0.65);
            }
            .chefcookie--blur body:after
            {
                backdrop-filter: grayscale(50%) blur(5px);
            }
            .chefcookie--overlay
            {
                top: 0;
            }
            .chefcookie--overlay .chefcookie__inner:before
            {
                content: '';
                display: inline-block;
                height: 100%;
                vertical-align: middle;
            }
            .chefcookie--overlay .chefcookie__box
            {
                width: 95%;
                max-width: 60em;
                box-shadow: 0 1em 5em -0.5em #000;
                background-color: ${plugin.config.style.color_background ?? '#eeeeee'};
            }
            .chefcookie--overlay .chefcookie__group
            {
                height: 13em;
                margin-bottom: 4%;
                background-color: rgba(${
                    plugin.config.style.color_background != '' &&
                    ['#000', '#000000', 'black'].indexOf(plugin.config.style.color_background) > -1
                        ? '255, 255, 255'
                        : '0, 0, 0'
                }, 0.05);
                border: 1px solid rgba(${
                    plugin.config.style.color_background != '' &&
                    ['#000', '#000000', 'black'].indexOf(plugin.config.style.color_background) > -1
                        ? '255, 255, 255'
                        : '0, 0, 0'
                }, 0.01);
                width: 48%;
                margin-right: 4%;
            }
            .chefcookie--overlay .chefcookie__group:nth-child(2n)
            {
                margin-right:0;
            }
            .chefcookie--overlay.chefcookie--has-scripts .chefcookie__group
            {
                height:auto;
                width: 100%;
                margin-right: 0;
                margin-bottom: 1em;
            }
            .chefcookie--overlay .chefcookie__group
            {
                padding: 1em 1.25em;
            }
            .chefcookie--bottombar,
            .chefcookie--topbar
            {
                background-color:${plugin.config.style.color_background ?? '#eeeeee'};
                box-shadow: 0 1em 5em -0.5em #000;
            }
            .chefcookie--bottombar
            {
                bottom:0;
                top:auto;
            }
            .chefcookie--topbar
            {
                bottom:auto;
                top:0;
                position:relative;
            }
            .chefcookie--bottombar .chefcookie__box,
            .chefcookie--topbar .chefcookie__box
            {
                max-width: 1280px;
            }
            .chefcookie--bottombar .chefcookie__group,
            .chefcookie--topbar .chefcookie__group
            {
                margin-bottom: 40px;
                margin-top: 40px;
                width: 22%;
                margin-right: 4%;
            }
            .chefcookie--bottombar .chefcookie__group:last-child,
            .chefcookie--topbar .chefcookie__group:last-child
            {
                margin-right:0;
            }
            .chefcookie--bottombar .chefcookie__groups--count-9 .chefcookie__group,
            .chefcookie--topbar .chefcookie__groups--count-9 .chefcookie__group { width: 7.55%; }
            .chefcookie--bottombar .chefcookie__groups--count-8 .chefcookie__group,
            .chefcookie--topbar .chefcookie__groups--count-8 .chefcookie__group { width: 9.00%; }
            .chefcookie--bottombar .chefcookie__groups--count-7 .chefcookie__group,
            .chefcookie--topbar .chefcookie__groups--count-7 .chefcookie__group { width: 10.85%; }
            .chefcookie--bottombar .chefcookie__groups--count-6 .chefcookie__group,
            .chefcookie--topbar .chefcookie__groups--count-6 .chefcookie__group { width: 13.33%; }
            .chefcookie--bottombar .chefcookie__groups--count-5 .chefcookie__group,
            .chefcookie--topbar .chefcookie__groups--count-5 .chefcookie__group { width: 16.80%; }
            .chefcookie--bottombar .chefcookie__groups--count-4 .chefcookie__group,
            .chefcookie--topbar .chefcookie__groups--count-4 .chefcookie__group { width: 22.00%; }
            .chefcookie--bottombar .chefcookie__groups--count-3 .chefcookie__group,
            .chefcookie--topbar .chefcookie__groups--count-3 .chefcookie__group { width: 30.66%; }
            .chefcookie--bottombar .chefcookie__groups--count-2 .chefcookie__group,
            .chefcookie--topbar .chefcookie__groups--count-2 .chefcookie__group { width: 48%; }
            .chefcookie--bottombar .chefcookie__groups--count-1 .chefcookie__group,
            .chefcookie--topbar .chefcookie__groups--count-1 .chefcookie__group { width: 100%; }
            @media screen and (max-width: 940px)
            {
                .chefcookie__button,
                .chefcookie__button:focus
                {
                    float: none;
                    margin: 0 0 1em;
                    text-align: center;
                    width: 100%;
                    min-width:0;
                }
            }
            @media screen and (max-width: 840px)
            {
                .chefcookie__box
                {
                    padding:1em;
                }
                .chefcookie__message h2
                {
                    font-size:1.5em;
                    line-height:1.4;
                }
                .chefcookie .chefcookie__group,
                .chefcookie--overlay .chefcookie__group,
                .chefcookie--bottombar .chefcookie__group,
                .chefcookie--topbar .chefcookie__group
                {
                    float:none;
                    margin-right:0;
                    width:100% !important;
                    height:auto;
                }
            }

  `};
