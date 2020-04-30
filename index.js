const { exec, spawn } = require('child_process')

const _ = require('lodash')
const inquirer = require('inquirer')
const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' })

function parseInstance(instance) {
  let obj = _.pick(instance, 'InstanceId', 'SubnetId', 'VpcId', 'PrivateIpAddress')
  obj.Name = _.find(instance.Tags, ['Key', 'Name']).Value
  obj.State = instance.State.Name
  return obj
}

function makePromptChoices(list) {
  const maxlen = _.max(list.map(i => i.Name.length))

  return list.map(obj => {
    if (maxlen + 2 >= obj.Name.length)
      obj.Name = obj.Name + Array(maxlen + 2 - obj.Name.length).join(' ')

    return {
      name: `${obj.Name} (${obj.State}: ${obj.PrivateIpAddress})`,
      short: obj.PrivateIpAddress,
      value: obj,
    }
  })
}

async function main() {
  let ec2 = new AWS.EC2()
  let instances = await ec2.describeInstances().promise()
  let list = instances.Reservations.map(x => parseInstance(x.Instances[0]))
  list = _.sortBy(list, 'Name')

  inquirer.prompt([
    { type: 'list', name: 'Pick server', choices: makePromptChoices(list) },
  ]).then(answers => {
    // console.log('you want to login to', answers)
    // sshrc -i ~/.ssh/volly-ma-prod ec2-user@${answer#*,} -t "sudo script -q -c 'screen -dR -c /tmp/.np.screenrc np' /dev/null"
    // spawn('sshrc', ['-i', '~/.ssh/volly-ma-prod', `ec2-user@${answers['Pick server'].PrivateIpAddress}`, '-t', `"sudo script -q -c 'screen -dR -c /tmp/.np.screenrc np' /dev/null"`], [null, null, null, 'ipc']).unref();
    // exec(`sshrc -i ~/.ssh/volly-ma-prod ec2-user@${answers['Pick server'].PrivateIpAddress} -t "sudo script -q -c 'screen -dR -c /tmp/.np.screenrc np' /dev/null"`).unref();
    // console.log(`ssh -i ~/.ssh/volly-ma-prod ec2-user@${answers['Pick server'].PrivateIpAddress} -t "sudo script -q -c 'screen -dR -c /tmp/.np.screenrc np' /dev/null"`)
    // console.log(answers['Pick server'].PrivateIpAddress)
    spawn('sshrc', ['-i', '~/.ssh/volly-ma-prod', `ec2-user@${answers['Pick server'].PrivateIpAddress}`, '-t', `"sudo script -q -c \\'screen -dR -c /tmp/.np.screenrc np\\' /dev/null"`], { stdio: 'inherit' });
  });
}

main()

