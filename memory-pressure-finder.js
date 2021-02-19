const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const cron = require('cron');	


async function checkForMemoryPressure(){
	const nodeList = await k8sApi.listNode()
		.then(response => {
			return response.body.items.map(v1Node => v1Node.metadata.name)
		});
	nodeList.forEach(node => {
		k8sApi.readNodeStatus(node)
			.then(response => {
				const conditions = response.body.status.conditions.filter(condition => {
					if(condition.type == 'MemoryPressure' && condition.status == false){
						return condition
					}
				})
				if(conditions.length[0]){
					console.log(response.body.metadata.name, conditions[0].status, new Date())
				}
				else{
					console.log('Nothing found');
				}
		});
	})
}

cron.job('* * * * * ', async () => {
	checkForMemoryPressure()	
}, null, true, null, this);	
