# enkrino

## enkrio是什么？
enkrio是一个极简的业务流程引擎。

## 为什么enkrio

[业务流程（business process）](https://en.wikipedia.org/wiki/Business_process)是一组相关的、具有结构的活动，这组活动按特定顺序被执行可产出产品或服务。[BPMN](https://en.wikipedia.org/wiki/Business_Process_Model_and_Notation)是当前应用最广的业务流程描述规范之一，主流的业务流程执行引擎如Activiti、Camunda、Flowable等也以支持BPMN业务模型为主。

虽然BPMN应用广泛，但它在某些场景下仍然存在不足。例如我们经常会使用BPMN建模一个如下图所示“审批”流程。

![Approval Process](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/flow1.puml)

但实际运行过程中，审批业务一般允许进行退回操作，如下图所示。

![Reject Process](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/reject.puml)

当然还可能存在更复杂的退回逻辑。例如下图所示，任意一个后续活动可以退回到任意一个前序活动。

![Reject Process 2](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/reject2.puml)


若需要支持“回退”逻辑，那采用BPMN这类的活动图来进行审批流程建模就需要在模型中表达出这样的活动关系。当流程节点数量增加时，回退关系的数量会呈几何级数增长。

此外，实际业务中可能还存在“回退后可直接提交至回退发起节点”这样的需要。如下图所示，如果“总办审批”直接回退到“发起申请”活动，则发起者可以修改后直接提交至总办进行重新审批。

![Reject Process 2](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/reject3.puml)
