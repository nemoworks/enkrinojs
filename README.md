# enkrino

## enkrio是什么？
enkrio是一个极简的业务流程引擎。

## 为什么enkrio

[业务流程（business process）](https://en.wikipedia.org/wiki/Business_process)是一组相关的、具有结构的活动，这组活动按特定顺序被执行可产出产品或服务。[BPMN](https://en.wikipedia.org/wiki/Business_Process_Model_and_Notation)是当前应用最广的业务流程描述规范之一，主流的业务流程执行引擎如Activiti、Camunda、Flowable等也以支持BPMN业务模型为主。

虽然BPMN应用广泛，但它在某些场景下仍然存在不足。例如我们经常会使用BPMN建模一个“审批”流程。

![Approval Process](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/doc/flow1.pu)

这种特定业务流程执行过程中，经常存在退回、撤销、越级提交和会签的具体业务需求，确定的流程模型