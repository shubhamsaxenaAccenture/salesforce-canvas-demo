var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    qrcode = require('qrcode-npm'),
    decode = require('salesforce-signed-request'),

    consumerSecret = process.env.CONSUMER_SECRET,

    app = express();

app.set('view engine', 'ejs');
app.use(bodyParser()); // pull information from html in POST
app.use(express.static(__dirname + '/public'));

app.post('/signedrequest', function(req, res) {

    // You could save this information in the user session if needed
    var signedRequest = decode(req.body.signed_request, consumerSecret),
        context = signedRequest.context,
        oauthToken = signedRequest.client.oauthToken,
        instanceUrl = signedRequest.client.instanceUrl;

        res.json("Hello World");

        query = "SELECT Id, Name, Phone, Owner FROM Account WHERE Id = '" + context.environment.record.Id + "'",

        contactRequest = {
            url: instanceUrl + '/services/data/v29.0/query?q=' + query,
            headers: {
                'Authorization': 'OAuth ' + oauthToken
            }
        };

    request(contactRequest, function(err, response, body) {
        var qr = qrcode.qrcode(4, 'L'),
            contact = JSON.parse(body).records[0],
            text = 'MECARD:N:' + contact.Name + ',' + contact.Phone + contact.Owner;
        qr.addData(text);
        qr.make();
        var imgTag = qr.createImgTag(4);
        res.render('index', {context: context, imgTag: imgTag});
    });

});

//app.redirect('https://hc9t06547.itcs.hpecorp.net:4144/?uniqueId=21761270-0062700000ga0su');

//app.redirect('https://hc9t06547.itcs.hpecorp.net:4144/?uniqueId=21761270-0062700000ga0su');

app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
