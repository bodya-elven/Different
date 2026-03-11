(function () {
    'use strict';

    function WikiInfoPlugin() {
        var _this = this;
        
        // Вшита ОРИГІНАЛЬНА SVG іконка Вікіпедії з білим глобусом та чорними символами/лініями
        // Я зберіг твій код і просто закрив теги в кінці.
        var ICON_WIKI = '<svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 98.05 98.05" xml:space="preserve"><g><path fill="#fff" d="M63.607 74.503c-.996-.052-2.687-.084-2.9-1.889-.107-.907 3.614-4.249 2.68-5.58-.233-.332-.909-.69-2.504-1.143-1.904-.42-5.314-.146-11.204 1.977-.265.096.079-.032-.132.044-.229.081-.111.033-.264.088.182-.061-.266.112-1.055.396-.064.031-.11.058-1.054.352-1.293-4.653 2.193-13.24 5.141-13.533 1.2-.119 2.541 1.554 4.262.615 3.1-1.691 3.417-4.277 2.988-7.469-.327-2.43-2.838-.132-4.525.527-1.833.716-1.871 1.146-2.373.659-1.528-1.483-.681-4.84 5.316-11.468 2.105-2.326 3.053-5.638 3.164-6.766.127-1.299-4.059 2.34-4.482 1.45-.294-.62 3.356-4.171 5.229-5.141.869-.45.874.51 1.494.439.808-.092 5.868-4.71 5.536-5.448-.218-.483-3.872 1.626-4.042 1.099-.092-.285 3.779-2.241 3.779-2.241s-.021-.099 0-.176c-1.523.546-21.552 6.944-37.303 30.537C6.151 89.584 16.574 140.516 54.6 165.541s89.339 14.686 114.546-23.067c12.603-18.876 16.318-41.086 12.127-61.688-4.193-20.602-17.543-39.097-22.496-41.477.989.968 1.641 1.579 1.361 1.933-.162.206-1.373.438-2.504-.791-1.132-1.228-6.436-5.342-7.074-6.283-.64-.94-.518-1.26-.176-1.318.342-.058.908.137 1.143.264.233.126-5.178-4.201-5.537-4.438-.357-.236-1.348-.638-1.537-.571-.332.117.862.941.658 1.143-.186.184-.742.08-1.186-.308-.223-.194-6.137-4.498-9.754-5.888-2.141.322-3.507.527-3.734.966-.326.629 4.822 2.7 5.096 3.208.288.532-.811 1.31-1.845 1.45-3.236.438-4.49-1.133-4.878-2.021-1.359-3.121-7.203-1.975-12.346 1.362-2.221 1.441-10.902 1.425-10.984.308-.158-2.147.639-3.563-4.614-2.68-3.693.62-4.682 1.931-4.35 2.197.615.495 3.137 1.382 3.339 2.197.137.554-3.165 3.657-12.259 3.032-.904 4.828-.866 5.897.044 7.381s2.371 2.057 3.208 1.846c1.93-.488 3.839-2.784 5.272-2.812 2.507-.052 4.208 2.361 4.086 5.624.013-.005.032.005.044 0-.003.114-.035.201-.044.308-.004.044.005.088 0 .132-.401 3.607-4.548 2.264-7.338 1.582-3.55-.869-3.575 11.03-.22 13.313-6.562-.697-14.868 2.424-19.245 4.35-3.61 1.588 3.413 4.926 2.197 6.063-1.427 1.335-4.397 2.606-6.678 3.164-1.283.311-4.358.531-5.315.481z"/><radialGradient id="a" cx="191.7842" cy="258.793" r="58.7893" gradientTransform="matrix(0 2.1396 2.1792 0 -509.2502 -338.2156)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset=".2352" stop-color="#fff"/><stop offset=".3321" stop-color="#EAEAEA"/><stop offset=".6773" stop-color="#C9C9C9"/><stop offset=".7017" stop-color="#C9C9C9"/><stop offset=".8872" stop-color="#919191"/><stop offset="1" stop-color="#636363"/></radialGradient><path fill="url(#a)" d="M63.608 74.503c-.996-.052-2.687-.084-2.9-1.889-.107-.907 3.614-4.249 2.68-5.58-.232-.332-.909-.69-2.504-1.143-1.904-.42-5.314-.146-11.204 1.977-.265.096.079-.032-.132.044-.229.081-.111.033-.264.088.182-.061-.265.112-1.055.396-.064.031-.109.058-1.054.352-1.293-4.653 2.193-13.24 5.141-13.533 1.2-.119 2.541 1.554 4.262.615 3.1-1.691 3.417-4.277 2.988-7.469-.327-2.43-2.838-.132-4.525.527-1.833.716-1.871 1.146-2.373.659-1.528-1.483-.681-4.84 5.316-11.468 2.105-2.326 3.053-5.638 3.164-6.766.127-1.299-4.059 2.341-4.482 1.45-.294-.621 3.356-4.171 5.229-5.141.869-.45.874.51 1.494.439.809-.092 5.869-4.71 5.536-5.448-.218-.483-3.872 1.626-4.042 1.099-.092-.285 3.779-2.241 3.779-2.241s-.021-.099 0-.176c-1.523.546-21.552 6.944-37.303 30.536-25.208 37.754-14.785 88.685 23.242 113.71s89.34 14.687 114.546-23.066c12.604-18.877 16.318-41.086 12.127-61.688-4.192-20.602-17.542-39.097-22.496-41.477.99.968 1.642 1.579 1.361 1.933-.162.206-1.373.438-2.504-.791-1.131-1.228-6.435-5.342-7.074-6.283-.639-.94-.518-1.26-.176-1.318.342-.058.908.137 1.143.264s-5.178-4.201-5.536-4.438-1.348-.638-1.538-.571c-.332.117.863.941.66 1.143-.187.184-.743.081-1.188-.308-.221-.194-6.137-4.498-9.754-5.888-2.141.322-3.506.527-3.734.966-.326.629 4.822 2.7 5.097 3.208.288.532-.812 1.31-1.845 1.45-3.236.438-4.49-1.133-4.877-2.021-1.361-3.122-7.204-1.976-12.348 1.362-2.22 1.441-10.902 1.425-10.984.308-.157-2.147.641-3.563-4.614-2.68-3.693.62-4.681 1.931-4.35 2.197.616.495 3.139 1.382 3.34 2.197.137.554-3.164 3.657-12.259 3.032-.904 4.828-.866 5.897.044 7.381s2.371 2.057 3.208 1.846c1.931-.488 3.839-2.783 5.272-2.812 2.507-.052 4.208 2.361 4.087 5.624.012-.005.031.005.043 0-.002.115-.035.201-.043.308-.004.044.004.088 0 .132-.4 3.607-4.549 2.264-7.338 1.582-3.55-.869-3.575 11.03-.22 13.313-6.562-.697-14.867 2.424-19.245 4.35-3.61 1.588 3.413 4.925 2.197 6.063-1.427 1.335-4.397 2.606-6.679 3.164-1.285.311-4.359.53-5.316.48z"/><path fill="#5a5a5a" stroke="#5a5a5a" stroke-width=".1406" d="M62.074 53.631c5.917.295 9.529-1.275 13.181-2.779-6.526-4.731 10.77-7.035 5.891-1.149 4.492.384 8.05-2.313 12.289-3.447 1.699-.455 5.111-.433 6.829-1.141-.091 4.183-4.501 2.734-7.404 2.024-3.55-.869-3.586 11.026-.231 13.309-6.562-.697-14.824 2.44-19.201 4.365-3.611 1.588 3.377 4.899 2.161 6.037-1.427 1.335-4.401 2.628-6.683 3.187-1.285.314-4.349.571-5.303.464s-.895-.784.829-2.853c1.242-1.491 1.875-2.633-.103-4.125-1.57-1.185-2.4-1.385-3.43-1.612-1.904-.42-5.327-.15-11.217 1.972 1.023-6.344 2.587-8.218 3.739-9.587 1.083-1.288 2.669-.521 4.794-.24 2.229.295 3.519-2.337 3.859-4.425z"/><path stroke="#000" stroke-width=".1406" d="M68.744 21.292s-3.967 2.121-3.875 2.406c.17.527 3.813-1.546 4.031-1.063.333.738-4.723 5.345-5.531 5.438-.62.071-.6-.918-1.469-.469-1.872.97-5.514 4.536-5.219 5.156.423.891 4.596-2.736 4.469-1.438-.11 1.128-1.051 4.455-3.156 6.781-5.998 6.627-6.841 9.955-5.313 11.438.502.487 2.344-.625 2.344-.625 1.964-5.714 6.981-7.681 7.969-12.969.226-1.21.02-1.227-1.188-3.281 0 0 1.249-1.125 2.031-1.594.815-.489.777.511 1.594.25 1.734-.553 3.134-2.167 4.344-3.719s.365-1.848.406-2.375c.043-.54.403.071 0-.875s-1.437-3.061-1.437-3.061zm61.688 2.875c.027.809-.082 1.658.063 2.438.117.637 1.934 1.56 3.219 2.063 1.041-.08 2.131-.905 1.844-1.438-.276-.508-2.726-1.136-5.126-3.063zm-33.907 3.687c-.087.522.048 2.832.344 4.219 1.196-.563 3.137-1.478 3-2.031-.202-.815-2.875-1.551-3.344-2.188zm47.907.375c-.298.394-.4.569-.5.719.498.388 1.002.497 1.188.313.202-.202-.513-.726-.688-1.032zm5.968 4.594c-.342.059-.482.403.156 1.344.882-.995.145-.141.969-1.063-.234-.126-.783-.34-1.125-.281zm8.375 6.469c-1.17 1.157-.174.194-1.156 1.156 1.131 1.228 2.338.987 2.5.781.279-.354-.353-.969-1.344-1.937zm-62.625.187c-1.433.029-3.382 2.356-5.313 2.844-1.674.423-2.505-1.282-3.625-2.375.419 2.476 1.034 4.875 3.281 5.406 2.117.5 4.474-2.694 6.563-2.688 1.222.003 2.539 2.195 3.156 2.875.303-3.486-1.442-6.116-4.062-6.062zm-37.031 7.906c-.186 3.294.569 6.747-2.531 8.438-1.721.938-3.082-.744-4.281-.625-2.947.292-6.418 8.878-5.125 13.531 1.96-.61.101-.021 2.344-.813.755-4.095 1.773-8.013 4.281-10.125 1.299-1.096 4.68.959 6.219-.313 1.943-1.605 3.816-6.872-.907-10.093zM63.4 67.042c.958 1.326-2.426 4.321-2.688 5.563s1.042 1.785 2.344 1.781c-1.044-.685 1.705-2.743 2.375-4.625.284-.799-.212-1.507-2.031-2.719z"/><path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width=".1406" d="M32.412 113.827c-1.185.124-1.599 1.118-.879 2.899-2.435-.447-4.144-.953-6.195-2.021-.48 1.264 2.94 1.971 4.569 2.725.09.605.144 1.238.22 1.846-.195-.256-.443-.459-.703-.659-.714-.552-1.29-.924-1.933-.923-.386.001-.617-.044-.835.22-.707.854-.31 2.048.747 3.032s2.498 1.458 3.12.791c.015-.017.03-.027.044-.045.211.977.466 1.951.966 2.856.132.132.777.646.747.527-.78-3.861-1.039-4.785-1.274-7.382.288.072.703.216 1.582.352.398 2.361.119.838 1.23 6.415.533.548.883.929 1.406 1.493-.68-3.897-1.222-4.959-1.45-7.732.39.226.708.215 1.054.396-.003-.021.226-.542-.132-1.055-3.581-.706-3.483-5.145 2.988-.527.032.022 1.054-.438.22-1.011-2.323-1.592-4.307-2.321-5.492-2.197zm-4.833 4.965c.362.026.963.272 1.362.615.646.555 1.289 1.3.791 1.714-.494.41-1.292-.223-1.889-.836s-.932-1.105-.527-1.449c.06-.053.142-.053.263-.044z"/><path stroke="#000" stroke-width=".1406" d="M31.279 138.551c2.245.87 3.332 3.609 3.798 4.205l2.302 1.248-1.851-3.752c.772-.086 6.449 2.748 8.879 5.448 1.968 2.188 2.914 4.53 1.476 6.102-.167.183-1.01.22-1.165-.319.596-.69.853-1.719.408-2.906-.445-1.186-1.411-2.67-2.122-3.26-1.477-1.227-3.42-2.387-5.599-3.216.885 2.069 2.06 4.501 3.54 6.911-1.352-1.131-1.916-2.512-2.774-3.524l-2.357-1.316c.228.331.855 1.528 1.227 2.265-.854-1.093-1.338-1.918-2.345-3.574-.447-.735-.79-1.477-1.366-2.206-.505-.64-1.174-1.19-1.331-1.247-.102-.039-.746.012-.72-.859z"/><path d="M172.113 85.299c-.967.927-1.264 2.099-.941 2.596.804 1.244 2.05-.029 2.58-.719.371-.481.592-1.152.541-1.706-.045-.494-.558-1.727-2.18-.171zm4.866 2.596c-.088-.452-1.49-5.836-1.514-5.91-.025-.073-.043-.131-.055-.173-.061-.218-.43-.188-.675-.234-.245-.046-.484-.063-.718-.048-.232.014-.359-.016-.379-.092-.031-.109.061-.231.271-.366.227-.144.582-.275 1.068-.396.486-.121.748-.08.787.122.122.593.281.922.572 2.066l1.088 4.28c.111.439.352 1.723.44 2.377s-.042 1.053-.211 1.161c-.132.085-.477-1.778-.674-2.787zm-.565-.766-2.438 2.766.28 1.094c.065.235.063.45.135.789.072.339.125.747.156 1.225.033.478-.026.76-.178.845-.072.007-.16-.11-.264-.35-.104-.24-.184-.481-.237-.723-.054-.242-.101-.419-.141-.533l-.398-1.786-1.257 1.033c-.066.062-.176.189-.331.381-.154.192-.281.319-.38.382-.163.104-.494.181-.995.232s-.772.001-.813-.15c-.01-.034 0-.074.029-.122.027-.047.057-.076.088-.086.504-.221 1.077-.536 1.72-.944.487-.309 1.177-.923 1.933-1.595.752-.67 1.371-1.322 1.892-1.811l1.032-1.146.167.499zm-4.014-2.833c.471-.279.98-.635 1.46-.524.479.11.898.697.952 1.254.064.676-.04 1.292-.371 1.912-.332.62-.799 1.247-1.33 1.68-1.371 1.115-2.192.694-2.592-.106-.396-.792.12-2.458.939-3.342.018-.022.095-.098.229-.228s.21-.21.227-.24c.038-.074.05-.136.036-.186s-.053-.094-.117-.133c-.064-.038-.102-.074-.111-.107l.011-.051c.013-.018.039-.04.081-.066.078-.049.191-.089.341-.12s.233-.013.252.055c.022.084.009.212-.044.383l.037-.181z"/><path d="m103.961 31.505 1.01-.483.758 1.986 2.913-1.468c1.34 4.981.802 9.445-2.849 14.859-.476-.436-.757-.975-.988-1.327 4.097-6.718 3.788-7.722 3.077-12.109l-4.487 2.434-.013 3.498-1.188.863.049-4.853 2.404-1.341m9.778-.697 3.335 5.569-.86.628-2.921-4.698c-.256.55-1.045 1.997-1.826 2.821-.086-.111-.178-.197-.273-.257-.086-.111-.156-.189-.213-.236 0 0-.136-.075-.408-.224.787-1.313 1.144-1.729 1.729-3.041.514-1.15.944-1.882 1.032-3.555l1.019-.045c-.089 1.414-.426 2.161-.614 3.038"/><path d="M178.598 107.902c1.643-2.445-.746-2.914-.467-4.624.494-3.038 3.916-8.803 4.438-9.109-1.035-.245-2-11.437-1.542-12.192-.687.412-.175 7.76 1.028 12.192-2.416 3.692-4.18 8.092-4.252 9.062-.149 2.02 1.713 2.822.795 4.671z"/><path d="M55.229 31.184c.885-.853 1.984-1.952 1.941-1.988-.162-.14-1.229.233-1.59.37-1.958 1.721-3.576 3.544-5.273 5.383l-.773.12c2.392-2.53 4.829-5.06 7.95-7.578l.649-.114-2.068 1.756c.244-.063.629-.189.806-.226.159-.032.945-.258 1.191-.146.313.143-1.321 1.537-1.993 2.281l-.84.142z"/><path d="M58.969 81.749c-.134.024-.26.064-.359.131-.199.135-.321.295-.364.482-.037.162-.01.313.093.472.104.16.286.275.528.304.065.007.179-.001.321-.018.146-.02.237-.041.264-.038.188.022.255.172.195.431-.068.301-.266.549-.572.728s-.653.319-1.017.439l-.065.306c1.415-.264 2.248-.875 2.466-1.83.069-.304 0-.595-.179-.892s-.456-.48-.856-.527c-.167-.018-.32-.012-.455.012zm8.536-.472c-2.23.313-4.12 1.124-5.375 2.238-1.255 1.115-2.066 2.763-1.883 4.066.166 1.176.583 2.34 1.685 2.972 1.102.632 1.86.886 3.091.887l.047.721-1.447.257c-.629.088-1.099.064-1.408-.045-.309-.108-.703-.478-.861-.84l-.788.047.222 2.153 6.373-.895-.079-1.903c-2.085-.249-2.477-.819-3.127-1.34-.523-.419-1.091-1.432-1.214-2.311-.17-1.213.39-2.792 1.319-3.664.876-.822 1.749-1.219 3.391-1.582 1.04-.23 2.946-.326 4.025.244.475.25 1.708 1.213 1.901 2.591.296 2.107-.671 4.239-3.649 5.69l.09 1.794 6.978-1.007-.267-2.28-.649.015c-.146.29-.567.881-.746 1.15-.168.252-.411.44-1.132.542l-2.073.287-.024-.752c1.415-.502 2.567-1.248 3.313-2.137.745-.889 1.031-2.446.876-3.547-.19-1.357-1.035-2.365-2.53-3.042-1.498-.677-3.897-.612-6.059-.309z"/>  <path d="M161.449 52.919c-.496.066-1.586.375-1.754.822-.118.316-.291.765.789 1.258.371.169 1.1-.34 1.711-.366 1.221-.052 2.189 2.046 1.615 3.61-.4 1.085-1.649 1.941-2.94 2.477-.895.372-1.572.294-2.188.143-.67-.164-1.162-.625-1.477-1.384-.217-.523-.359-1.106-.426-1.75.002-.541.434-.634.66.592.255.613.722 1.231 1.273 1.361.553.13 1.223.032 2.012-.296.604-.25 1.283-.871 1.824-1.592.903-1.203.557-2.109-.044-2.299-.286-.09-1.134.487-1.762.425-1.143-.114-1.999-1.556-2.001-2.071-.002-.652.468-1.021.906-1.326.699-.484 1.922-1.061 1.802.396zm2.795 6.933-.137 1.33-1.49-.141.242-1.248 1.385.059zm-2.012 1.318-.119 1.331-1.483-.126.104-1.325 1.498.12z"/>  <path d="m66.152 116.143-.277.145c.939.642 1.555 1.14 1.811 1.516.256.375.547.396.92.043.373-.354.455-.633.219-.81s-1.129-.478-2.673-.894zm7.088-.134c.175.862.79 4.597 2.255 10.798l-1.609.047-.792-.302.891.854c.654-.191 1.392-.326 2.207-.42l12.679-1.448-2.348-.881-1.47.916-2.177-9.57 1.071-.461-1.887-.646-1.298.787-5.57.639-1.952-.313zm1.642.622 6.235-.697.545 2.972-6.073.703-.707-2.978zm-5.067 1.408-.601.562-5.98.584.796.327c.549-.153 1.16-.251 1.843-.318l3.161-.327c-.698 1.203-1.566 2.261-2.606 3.163s-2.141 1.684-3.328 2.367l.285.125c1.674-.832 3.053-1.617 4.106-2.387.295 3.041.448 4.899.45 5.566l1.349-.604c-.123-.622-.32-2.233-.576-4.878 1.299.473 2.144.871 2.555 1.231s.736.417.961.146c.224-.273.283-.527.199-.753s-.817-.474-2.221-.736c.641-.497 1.307-1.015 2.007-1.551l.728-.202-1.628-.516c-.302.764-.807 1.51-1.491 2.211l-1.153-.174-.045-.561c.56-.688 1.143-1.444 1.752-2.271l.998-.398-1.561-.606zm5.812 1.86 6.1-.706.635 3.04-6.183.69-.552-3.024zm.616 3.312 6.232-.723.712 3.434-6.232.724-.712-3.435z"/><path d="M135.103 95.226c.32-.099.616-.12.888-.063.272.057.436.172.49.347.133.431-.228.949-1.082 1.553-.854.604-2.313 1.225-4.378 1.864-2.075.642-3.634.954-4.674.936s-1.628-.243-1.761-.674c-.053-.169.015-.355.201-.556.188-.201.451-.354.791-.459.341-.105.652-.134.933-.085.28.049.708.215 1.282.5.806.41 1.849.417 3.129.021 1.27-.393 2.127-.987 2.57-1.783.303-.561.553-.938.753-1.133.2-.198.485-.353.858-.468zm1.386 4.092c-.171-.547-.909-.302-2.011-.067l-.084-.269 6.609-2.317.082.269c-1.174.571-2.123 1.088-1.938 1.647l1.751 7.807c.082.219.89.061 2.086-.222l.083.269-6.488 2.455-.082-.269c1.322-.657 2.117-1.132 1.877-1.882l-1.324-6.236-8.182 10.198c.425.067 1.489-.018 2.287-.194l.082.27-7.271 2.209-.082-.27c1.531-.727 2.307-1.111 2.235-1.504l-1.731-7.873c-.054-.456-1.4-.392-2.521-.112l-.083-.269 7.73-2.429.083.269c-.82.394-2.871 1.131-2.659 1.831l1.458 6.608 8.093-9.919z"/><path d="M177.732 116.47c-.322.206-1.773 3.194-2.62 4.923l-1.312 1.454.086-3.426c-.559 1.03-1.526 1.255-1.662 1.103-.2-.225.041-1.359.59-2.082.421-.554 1.342-1.549 1.951-1.62.958-.112.147 2.568.246 3.804.795-1.842 1.741-3.536 2.863-5.248l.22-2.709c-.042-.51-.333-.746-.884-.481-.553.266-1.168.88-1.834 1.615-.911 1.005-2.25 2.491-2.743 3.888l-1.415 1.318c.217-2.534 4.01-6.493 6.432-8.529.545-.459 1.1-.283 1.264.363.166.65-.114 1.461-.086 2.986.828-.791.996-.787.871.221-.131 1.063-.949 2.568-1.625 3.592-.529.8-.501-.103-.342-1.172zm-4.312 1.925c-.373.457-.561.673-.521 1.093.027.31.295.104.619-.188.331-.296.548-.658.533-1.078-.02-.519-.377-.137-.631.173zm5.258-3.317c-.193.4-.273.944-.127 1.034.129.078.279-.296.434-.659.102-.237.318-.85.178-.986-.132-.126-.366.366-.485.611z"/><path d="M130.316 60.954c.017.056.007.115-.03.178-.038.063-.087.103-.148.122-.499.188-.88.426-1.146.714-.265.288-.487.75-.668 1.388l-2.384 9.559c-.012.085-.097.152-.255.201-.123.038-.23.03-.322-.024l-4.227-3.29-2.108 5.227c-.046.095-.13.162-.253.2-.152.046-.263.04-.334-.021l-7.621-6.474c-.477-.401-.922-.647-1.34-.736-.418-.089-.953-.06-1.607.089-.055.017-.111.012-.172-.013-.061-.025-.098-.063-.113-.115-.041-.131-.006-.213.104-.247.461-.141.945-.273 1.456-.398.476-.115.919-.235 1.331-.361.418-.128.908-.293 1.471-.495.588-.211 1.113-.387 1.572-.527.111-.034.186.015.227.146.039.131.025.207-.044.228-.453.164-.791.354-1.015.571-.223.216-.301.434-.233.654.034.112.132.235.294.37l6.268 5.248 1.469-3.851-3.238-2.527c-.582-.451-1.027-.719-1.34-.805-.311-.086-.736-.067-1.277.057-.048.015-.1.009-.156-.017-.057-.026-.094-.065-.109-.116-.04-.131-.012-.211.084-.24.461-.141.887-.256 1.279-.345.38-.085.779-.192 1.197-.32.412-.126.844-.273 1.296-.442.466-.173.929-.33 1.388-.471.11-.034.186.015.226.146s.025.207-.043.228c-.907.323-1.313.642-1.218.955.043.14.215.325.519.554l2.124 1.604.906-2.338c.125-.329.159-.585.104-.767-.131-.43-.662-.518-1.59-.265-.082.025-.145-.028-.184-.159-.015-.047-.008-.098.021-.152.028-.055.063-.088.104-.101.33-.101.739-.21 1.229-.329.469-.113.851-.214 1.146-.305.213-.065.522-.172.927-.321.512-.192.943-.342 1.293-.449.082-.025.141.019.176.131.045.149-.008.247-.158.293-.524.201-.925.433-1.201.696-.275.263-.569.759-.88 1.487l-1.217 3.092 3.813 2.895 1.636-7.369c.066-.271.071-.502.013-.693-.14-.458-.675-.56-1.603-.307-.083.025-.145-.028-.185-.159s.002-.215.126-.253c.336-.103.738-.21 1.207-.323.436-.103.797-.198 1.084-.286.303-.092.648-.213 1.039-.363.402-.154.77-.281 1.099-.382.092-.031.156.01.191.123z"/> <path d="M145.187 140.114c-.021-3.786-.076-3.94-.208-6.634-4.428 1.7-11.522 4.574-12.641 4.791-1.17.228-2.635.102-2.391-.762.199-.708 1.609-2.193 2.875-2.657-.405.536-.694 1.016 0 1.063.892.061 4.592-1.49 6.398-2.082 1.789-.587 5.521-2.623 6.624-2.18 1.12.451.882 4.145.882 6.814.001.38.115.701-.063.971-.325.5-.958.557-1.476.676z"/> <path d="M83.363 153.66c.276.33 1.403.373 1.981.571.579.198 3.501.315 4.41.253 1.026-.07 2.216-.533 2.75-.904.459-.317.728-.688.699-1.102-.064-.938-2.606-1.73-4.619-2.158-1.843-.391-5.326-.01-7.9.089-3.184.122-5.569.262-8.387.286-.338.002-.784-.311-.782-.625.003-.475.675-.66.758-1.268.02-.144.039-.277-.045-.31-.05-.019-.517-.038-.749-.005-.179.027-.329.123-.895.146-.232.01-.668 0-.965-.128-.261-.112-1.051-.552.049-.737.39-.065 2.347-.352 3.133.311.803.676-.072 1.525-.072 1.525s2.511.003 3.801-.035c3.388-.103 11.173-.786 11.173-.786.527-.036 1.762-.397 2.083-.595.301-.184.521-.401.431-.582-.379-.76-.868-.73-1.895-.915 1.527-.323 3.148.054 3.233.956.1 1.063-1.098 1.646-2.437 2.178 1.419.221 3.218.806 4.082 1.311.865.506 1.439.916 1.482 1.541.044.635-.284 1.193-1.093 1.711-.922.582-2.147 1.006-4.222 1.096-1.713.073-4.599-.369-5.631-.815-.951.584-2.782 1.21-4.463 1.325-1.515.105-3.691-.14-4.405-.508-.909-.467-1.469-.793-1.509-1.376-.032-.46.099-.927.801-1.106.286-.072 1.356-.307 2.599-.225 1.57.104 3.349.793 2.332 1.661-.234.2-.641.144-1.171-.009 1.156-1.217-3.406-1.022-3.368-.462.023.337.332.604.925.804.604.21 2.759.347 3.629.287.929-.064 2.404-.471 2.964-.744s1.038-.295 1.293-.656zm-12.06-5.578c.003-.104-.424-.121-.662-.117-.235.002-.641.053-.638.137.003.084.386.188.62.185.231 0 .211-.082.215-.189l-.014-.016z"/></svg>';
        var cachedResults = null;
        var searchPromise = null;
        var isOpened = false;

        this.init = function () {
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite') {
                    _this.cleanup();
                    setTimeout(function() {
                        try {
                            _this.render(e.data, e.object.activity.render());
                        } catch (err) {}
                    }, 100);
                }
            });
        };

        this.cleanup = function() {
            $('.lampa-wiki-button').remove();
            cachedResults = null;
            searchPromise = null;
            isOpened = false;
        };

        this.render = function (data, html) {
            var container = $(html);
            if (container.find('.lampa-wiki-button').length) return;

            // Змінено структуру кнопки: вставлено SVG безпосередньо, без img
            var button = $('<div class="full-start__button selector lampa-wiki-button">' +
                                ICON_WIKI +
                                '<span>Wikipedia</span>' +
                            '</div>');

            var style = '<style>' +
                /* Оновлені стилі для ідеального центрування іконки */
                '.lampa-wiki-button { display: flex !important; align-items: center; justify-content: center; gap: 7px; opacity: 0.7; transition: opacity 0.3s; } ' +
                '.lampa-wiki-button.ready { opacity: 1; } ' +
                '.lampa-wiki-button svg { width: 1.6em; height: 1.6em; margin: 0 !important; } ' +
                
                '.wiki-select-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 5000; display: flex; align-items: center; justify-content: center; }' +
                '.wiki-select-body { width: 90%; max-width: 700px; background: #1a1a1a; border-radius: 10px; padding: 20px; border: 1px solid #333; max-height: 85vh; display: flex; flex-direction: column; position: relative; overflow: hidden; }' +
                '.wiki-items-list { overflow-y: auto; flex: 1; -webkit-overflow-scrolling: touch; }' +
                '.wiki-item { padding: 12px 15px; margin: 8px 0; background: #252525; border-radius: 8px; display: flex; align-items: center; gap: 15px; border: 2px solid transparent; cursor: pointer; }' +
                '.wiki-item.focus { border-color: #fff; background: #333; outline: none; }' +
                '.wiki-item__lang { font-size: 1.5em; width: 35px; text-align: center; }' +
                '.wiki-item__info { display: flex; flex-direction: column; flex: 1; }' +
                '.wiki-item__type { font-size: 0.85em; color: #999; margin-bottom: 2px; text-transform: none; }' + 
                '.wiki-item__title { font-size: 1.2em; color: #fff; font-weight: 500; }' + 
                
                '.wiki-viewer-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 5001; display: flex; align-items: center; justify-content: center; }' +
                '.wiki-viewer-body { width: 100%; height: 100%; background: #121212; display: flex; flex-direction: column; position: relative; }' +
                '.wiki-header { padding: 15px; background: #1f1f1f; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }' +
                '.wiki-title { font-size: 1.6em; color: #fff; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; }' +
                '.wiki-close-btn { width: 45px; height: 45px; background: #333; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 26px; border: 2px solid transparent; cursor: pointer; }' +
                '.wiki-close-btn.focus { border-color: #fff; background: #555; outline: none; }' +
                
                '.wiki-content-scroll { flex: 1; overflow-y: auto; padding: 20px 5%; color: #d0d0d0; line-height: 1.6; font-size: 1.3em; -webkit-overflow-scrolling: touch; }' +
                '.wiki-loader { text-align: center; margin-top: 50px; color: #888; }' +
                
                '.wiki-content-scroll table { font-size: inherit !important; }' + 
                
                '.wiki-content-scroll h1, .wiki-content-scroll h2 { color: #fff; border-bottom: 1px solid #333; margin-top: 1.5em; padding-bottom: 0.3em; }' +
                '.wiki-content-scroll p { margin-bottom: 1em; text-align: justify; }' +
                '.wiki-content-scroll a { color: #8ab4f8; text-decoration: none; pointer-events: none; }' +
                '.wiki-content-scroll .infobox { background: #1a1a1a !important; border: 1px solid #333; color: #ccc; margin-bottom: 20px; box-sizing: border-box; }' +
                '.wiki-content-scroll .infobox td, .wiki-content-scroll .infobox th { padding: 5px; border-bottom: 1px solid #333; vertical-align: top; }' +
                '.wiki-content-scroll img { max-width: 100%; height: auto; border-radius: 5px; }' +
                '.wiki-content-scroll table { background: #1a1a1a !important; color: #ccc !important; width: 100% !important; display: block; overflow-x: auto; margin: 15px 0; border-collapse: collapse; }' +
                '.wiki-content-scroll table td, .wiki-content-scroll table th { border: 1px solid #444; padding: 8px; background: transparent !important; color: inherit !important; min-width: 100px; }' +
                '.wiki-content-scroll .mw-empty-elt, .wiki-content-scroll .hatnote, .wiki-content-scroll .ambox, .wiki-content-scroll .navbox { display: none; }' +

                '@media (max-width: 900px) {' +
                    '.wiki-content-scroll .infobox { float: none !important; width: 100% !important; margin: 0 auto 20px auto !important; }' +
                '}' +
                '@media (min-width: 901px) {' +
                    '.wiki-content-scroll .infobox { float: right; width: 320px; margin-left: 20px; }' +
                '}' +
                '</style>';

            if (!$('style#wiki-plugin-style').length) $('head').append('<style id="wiki-plugin-style">' + style + '</style>');

            var buttons_container = container.find('.full-start-new__buttons, .full-start__buttons');
            buttons_container.append(button);

            _this.performSearch(data.movie, function(hasResults) {
                if (hasResults) button.addClass('ready');
            });

            button.on('hover:enter click', function() {
                if (!isOpened) _this.handleButtonClick(data.movie);
            });
        };

        this.handleButtonClick = function(movie) {
            var _this = this;
            if (!movie) return;
            isOpened = true;

            if (cachedResults) {
                if (cachedResults.length > 0) _this.showMenu(cachedResults, movie.title || movie.name);
                else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
            } else if (searchPromise) {
                Lampa.Noty.show('Збір даних з Wikidata...');
                searchPromise.done(function(results) {
                    if (results.length) _this.showMenu(results, movie.title || movie.name);
                    else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
                }).fail(function() {
                    Lampa.Noty.show('Помилка завантаження даних'); isOpened = false;
                });
            } else {
                _this.performSearch(movie, function(hasResults) {
                     if (hasResults) _this.showMenu(cachedResults, movie.title || movie.name);
                     else { Lampa.Noty.show('Нічого не знайдено'); isOpened = false; }
                });
            }
        };
        this.performSearch = function (movie, callback) {
            if (!movie || !movie.id) return $.Deferred().reject().promise();
            var _this = this;
            var def = $.Deferred();
            
            var method = (movie.original_name || movie.name) ? 'tv' : 'movie';
            var mainType = method === 'tv' ? 'television series' : 'film';
            var tmdbKey = Lampa.TMDB.key();

            $.ajax({
                url: Lampa.TMDB.api(method + '/' + movie.id + '/external_ids?api_key=' + tmdbKey),
                dataType: 'json',
                success: function(extResp) {
                    var mainQId = extResp.wikidata_id;
                    
                    if (!mainQId) {
                        cachedResults = [];
                        if (callback) callback(false);
                        def.reject();
                        return;
                    }

                    $.ajax({
                        url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + mainQId + '&props=claims&format=json&origin=*',
                        dataType: 'json',
                        success: function(claimResp) {
                            var claims = claimResp.entities[mainQId].claims || {};
                            var targets = [];

                            var extractQIds = function(prop, typeName, limit) {
                                if (claims[prop]) {
                                    var items = claims[prop];
                                    if (limit) items = items.slice(0, limit);
                                    items.forEach(function(item) {
                                        if (item.mainsnak && item.mainsnak.datavalue && item.mainsnak.datavalue.value && item.mainsnak.datavalue.value.id) {
                                            targets.push({ qId: item.mainsnak.datavalue.value.id, type: typeName });
                                        }
                                    });
                                }
                            };

                            targets.push({ qId: mainQId, type: mainType });
                            extractQIds('P144', 'based on');
                            extractQIds('P155', 'follows');
                            extractQIds('P156', 'followed by');
                            extractQIds('P161', 'cast member', 5);
                            extractQIds('P725', 'voice actor', 3);
                            extractQIds('P57', 'director');
                            extractQIds('P1877', 'after a work by');
                            extractQIds('P138', 'named after');
                            extractQIds('P179', 'part of the series');

                            if (targets.length === 0) {
                                cachedResults = [];
                                if (callback) callback(false);
                                def.reject();
                                return;
                            }

                            var qIdList = targets.map(function(t) { return t.qId; });
                            var uniqueQIds = qIdList.filter(function(item, pos) { return qIdList.indexOf(item) == pos; });

                            $.ajax({
                                url: 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + uniqueQIds.join('|') + '&props=sitelinks&format=json&origin=*',
                                dataType: 'json',
                                success: function(siteResp) {
                                    var finalResults = [];
                                    var entities = siteResp.entities || {};

                                    targets.forEach(function(t) {
                                        var entity = entities[t.qId];
                                        if (entity && entity.sitelinks) {
                                            if (entity.sitelinks.ukwiki) {
                                                finalResults.push({
                                                    typeTitle: t.type,
                                                    title: entity.sitelinks.ukwiki.title,
                                                    lang: 'ua',
                                                    lang_icon: '🇺🇦',
                                                    key: entity.sitelinks.ukwiki.title
                                                });
                                            } else if (entity.sitelinks.enwiki) {
                                                finalResults.push({
                                                    typeTitle: t.type,
                                                    title: entity.sitelinks.enwiki.title,
                                                    lang: 'en',
                                                    lang_icon: '🇺🇸',
                                                    key: entity.sitelinks.enwiki.title
                                                });
                                            }
                                        }
                                    });

                                    cachedResults = finalResults;
                                    if (callback) callback(finalResults.length > 0);
                                    def.resolve(finalResults);
                                },
                                error: function() {
                                    cachedResults = [];
                                    if (callback) callback(false);
                                    def.reject();
                                }
                            });
                        },
                        error: function() {
                            cachedResults = [];
                            if (callback) callback(false);
                            def.reject();
                        }
                    });
                },
                error: function() {
                    cachedResults = [];
                    if (callback) callback(false);
                    def.reject();
                }
            });

            searchPromise = def.promise();
            return searchPromise;
        };

        this.showMenu = function(items, movieTitle) {
            var _this = this;
            var current_controller = Lampa.Controller.enabled().name;
            
            var menu = $('<div class="wiki-select-container"><div class="wiki-select-body">' +
                            '<div style="font-size: 1.4em; margin-bottom: 20px; color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px;">Wikipedia: ' + movieTitle + '</div>' +
                            '<div class="wiki-items-list"></div></div></div>');

            items.forEach(function(item) {
                var el = $('<div class="wiki-item selector">' +
                                '<div class="wiki-item__lang">' + item.lang_icon + '</div>' +
                                '<div class="wiki-item__info">' +
                                    '<div class="wiki-item__type">' + item.typeTitle + '</div>' +
                                    '<div class="wiki-item__title">' + item.title + '</div>' +
                                '</div>' +
                            '</div>');
                el.on('hover:enter click', function() {
                    menu.remove();
                    _this.showViewer(item.lang, item.key, item.title, current_controller); 
                });
                menu.find('.wiki-items-list').append(el);
            });

            $('body').append(menu);

            Lampa.Controller.add('wiki_menu', {
                toggle: function() {
                    Lampa.Controller.collectionSet(menu);
                    Lampa.Controller.collectionFocus(menu.find('.wiki-item')[0], menu);
                },
                up: function() {
                    var index = menu.find('.wiki-item').index(menu.find('.wiki-item.focus'));
                    if (index > 0) {
                        Lampa.Controller.collectionFocus(menu.find('.wiki-item')[index - 1], menu);
                        
                        /* Повноцінна прокрутка вгору */
                        var list = menu.find('.wiki-items-list');
                        var focusItem = menu.find('.wiki-item.focus');
                        if (focusItem.length && focusItem.position().top < 50) {
                            list.scrollTop(list.scrollTop() - 100);
                        }
                    }
                },
                down: function() {
                    var index = menu.find('.wiki-item').index(menu.find('.wiki-item.focus'));
                    if (index < items.length - 1) {
                        Lampa.Controller.collectionFocus(menu.find('.wiki-item')[index + 1], menu);
                        
                        /* Оптимізована прокрутка вниз */
                        var list = menu.find('.wiki-items-list');
                        var focusItem = menu.find('.wiki-item.focus');
                        if (focusItem.length && focusItem.position().top > list.height() - 100) {
                            list.scrollTop(list.scrollTop() + 100);
                        }
                    }
                },
                back: function() {
                    menu.remove();
                    isOpened = false;
                    Lampa.Controller.toggle(current_controller); 
                }
            });

            Lampa.Controller.toggle('wiki_menu');
        };

        this.showViewer = function (lang, key, title, prev_controller) {
            var viewer = $('<div class="wiki-viewer-container"><div class="wiki-viewer-body">' +
                                '<div class="wiki-header">' +
                                    '<div class="wiki-title">' + title + '</div>' +
                                    '<div class="wiki-close-btn selector">×</div>' +
                                '</div>' +
                                '<div class="wiki-content-scroll">' +
                                    '<div class="wiki-loader">Завантаження...</div>' +
                                '</div></div></div>');

            $('body').append(viewer);

            var closeViewer = function() {
                viewer.remove();
                isOpened = false;
                Lampa.Controller.toggle(prev_controller);
            };

            viewer.find('.wiki-close-btn').on('click hover:enter', function(e) {
                e.preventDefault();
                closeViewer();
            });

            Lampa.Controller.add('wiki_viewer', {
                toggle: function() {
                    Lampa.Controller.collectionSet(viewer);
                    Lampa.Controller.collectionFocus(viewer.find('.wiki-close-btn')[0], viewer);
                },
                up: function() { 
                    viewer.find('.wiki-content-scroll').scrollTop(viewer.find('.wiki-content-scroll').scrollTop() - 100); 
                },
                down: function() { 
                    viewer.find('.wiki-content-scroll').scrollTop(viewer.find('.wiki-content-scroll').scrollTop() + 100); 
                },
                back: closeViewer
            });

            Lampa.Controller.toggle('wiki_viewer');

            var apiUrl = 'https://' + (lang === 'ua' ? 'uk' : 'en') + '.wikipedia.org/api/rest_v1/page/html/' + encodeURIComponent(key);

            $.ajax({
                url: apiUrl,
                timeout: 15000,
                success: function(htmlContent) {
                    htmlContent = htmlContent.replace(/src="\/\//g, 'src="https://');
                    htmlContent = htmlContent.replace(/href="\//g, 'href="https://wikipedia.org/');
                    htmlContent = htmlContent.replace(/srcset=/g, 'data-srcset='); // Фікс для відображення фото
                    htmlContent = htmlContent.replace(/style="[^"]*"/g, ""); 
                    htmlContent = htmlContent.replace(/bgcolor="[^"]*"/g, "");
                    
                    var contentDiv = viewer.find('.wiki-content-scroll');
                    contentDiv.html(htmlContent);
                    contentDiv.find('script, style, link').remove();
                },
                error: function() {
                    viewer.find('.wiki-loader').text('Не вдалося завантажити статтю');
                }
            });
        };
    }

    if (window.Lampa) window.wiki_info = new WikiInfoPlugin().init();
})();
