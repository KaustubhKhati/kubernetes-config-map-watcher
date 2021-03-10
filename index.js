process.env.KUBECONFIG = '<ABSOLUTE PATH TO KUBECONFIG>' //ONLY FOR LOCAL TESTING
const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

function watchConfigMap(){
	const watch = new k8s.Watch(kc);
	console.log('watching started');
	const configMapURL = '/api/v1/namespaces/ecg-ppe/configmaps';
	const options = {
        allowWatchBookmarks: true,
    }; 
    const handleChange = (type, apiObj, watchObj) => {
        if (type === 'MODIFIED') {
            // tslint:disable-next-line:no-console

            console.log(watchObj.object.metadata.name)
            if( watchObj.object.metadata.name == 'active-dc-config-map'){
            	const data = JSON.parse(watchObj.object.data.config);
            	console.log(data)
            }
        } else if (type === 'DELETED') {
            // tslint:disable-next-line:no-console
            console.log('deleted object:');
        } else if (type === 'BOOKMARK') {
            // tslint:disable-next-line:no-console
            console.log(`bookmark: ${watchObj.metadata.resourceVersion}`);
        }
    }
    const handleError = function err(err) {
        // tslint:disable-next-line:no-console
        if(!err){
        	console.log('exited')
        }
        console.log(err);
        startWatchAgain();
    };
	watch.watch(configMapURL, options, handleChange, handleError)
}

function startWatchAgain() {
	watchConfigMap()
}

// app.listen('9000', () => {
// 	console.log('Started')
// 	watchConfigMap();
// });

watchConfigMap();

