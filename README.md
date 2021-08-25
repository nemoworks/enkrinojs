# enkrino

## enkrio是什么？
enkrio是一个极简的业务流程引擎。

## 为什么enkrio

[业务流程（business process）](https://en.wikipedia.org/wiki/Business_process)是一组相关的、具有结构的活动，这组活动按特定顺序被执行可产出产品或服务。[BPMN](https://en.wikipedia.org/wiki/Business_Process_Model_and_Notation)是当前应用最广的业务流程描述规范之一，主流的业务流程执行引擎如Activiti、Camunda、Flowable等也以支持BPMN业务模型为主。

虽然BPMN应用广泛，但它在某些场景下仍然存在不足。例如我们经常会使用BPMN建模一个如下图所示“审批”流程。

![Approval Process](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/flow1.puml)

但实际运行过程中，审批业务一般允许进行退回操作，如下图所示。

![Reject Process](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/reject.puml)

或者

![Reject Process 2](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/reject2.puml)

当然还可能存在更复杂的退回逻辑（任意一个后续活动可以退回到任意一个前序活动，这种情况使用plantuml工具的活动图都很难表达出来）。

