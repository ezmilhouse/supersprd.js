
supersprd
    .create('shop')
    .id('6881a2fa-867b-48a5-8604-2b0e5ff43cb1')
    .is({
        context  : 'shop',
        locale   : 'de_DE',
        platform : 'EU'
    })
    .of('205909')
    .end();

// --- .api(), method as option

supersprd
    .get('shop')
    .api('GET', '/articles', {
        fullData : true
    }, function(err, res) {
        log(res);
    });

// --- .get(), convenient method

var shop = supersprd.get('shop');

shop.get('/articles', {
    fullData : true
}, function(err, res) {
    log(res);
});

// --- .use(), use existing instance

supersprd
    .use('shop', function(err, SP, resources) {
        log('SP', SP);
    })
    .end();

// ---

supersprd
	.create('shop')
	.id('6881a2fa-867b-48a5-8604-2b0e5ff43cb1')
	.is('context', 'shop')
	.is('locale', 'de_DE')
	.is('platform', 'EU')
	.is('proxy', '/proxy/sprd')
	.is('type', 'json')
	.of('205909')
	.end();

supersprd
	.create('user')
	.id('6881a2fa-867b-48a5-8604-2b0e5ff43cb1')
	.is('context', 'shop')
	.is('locale', 'de_DE')
	.is('platform', 'EU')
	.is('proxy', '/proxy/sprd')
	.is('type', 'json')
	.of('123456', 'xxx@gmail.com', 'xxx') // add sprd creds here
	.end();

log('Supersprd.js', supersprd.version);