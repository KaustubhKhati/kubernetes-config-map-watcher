process.env.KUBECONFIG = './kube-config'
const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const autoK8sApi = kc.makeApiClient(k8s.AutoscalingV2beta2Api)
const cron = require('cron');	


async function checkForMemoryPressure(){
	try{
		const nodeList = await k8sApi.listNode()
			.then(response => {
				return response.body.items.map(v1Node => v1Node.metadata.name)
			});
		nodeList.forEach(node => {
			k8sApi.readNodeStatus(node)
				.then(response => {
					const conditions = response.body.status.conditions.filter(condition => {	
						
						if(condition.type == 'MemoryPressure' && condition.status == 'True'){
							return condition
						}
					})
					if(conditions.length > 0){
						console.log(response.body.metadata.name, conditions[0].status, new Date(), 'Pressure Found')
					}
			});
		})
		console.log(`Loop Passed at ${new Date()}`)
	}
	catch(error){
		console.log(error)
	}
}

cron.job('* * * * * ', async () => {
	checkForMemoryPressure()	
}, null, true, null, this);	
