// Item list data array for filling in info box
var itemListData = [];

$(document).ready(function() {

    // Populate the item table on initial page load
    populateTable();

    // ItemId link click
    $('#itemList table tbody').on('click', 'td a.linkshowitem', showItemInfo);

    // Add item button click
    $('#btnAddItem').on('click', addItem);

});

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON('/items/itemlist', function(data) {

        // Stick our item data array into an itemList variable in the global object
        itemListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function() {
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowitem" rel="' + this.id + '" title="Show Details">' + this.id + '</a></td>';
            tableContent += '<td>' + this.price + '</td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#itemList table tbody').html(tableContent);
    });
};

// Show Item Info
function showItemInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve item id from link rel attribute
    var thisItemId = $(this).attr('rel');

    console.log("item id: " + thisItemId);

    // Get Index of object based on id value
    var arrayPosition = itemListData.map(function(arrayItem) {
        return arrayItem.id;
    }).indexOf(thisItemId);

    // Get our Item Object
    var thisItemObject = itemListData[arrayPosition];

    //Populate Info Box
    $('#itemInfoId').text(thisItemObject.id);
    $('#itemInfoPrice').text(thisItemObject.price);

};

// Add Item
function addItem(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addItem input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all item info into one object
        var newItem = {
            'id': $('#addItem fieldset input#inputItemId').val(),
            'price': $('#addItem fieldset input#inputItemPrice').val()
        }

        // Use AJAX to post the object to our additem service
        $.ajax({
            type: 'POST',
            data: newItem,
            url: '/items/additem',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addItem fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete Item
function deleteItem(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this item?');

    // Check and make sure the item confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/items/deleteitem/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

