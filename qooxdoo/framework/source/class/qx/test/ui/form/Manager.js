/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.form.Manager", 
{
  extend : qx.test.ui.LayoutTestCase,
  
  construct : function() {
    this.base(arguments);
  },

  members :
  {
    __username : null,
    __password1 : null,
    __password2 : null,
    __manager : null,
    
    setUp: function() {
      this.__username = new qx.ui.form.TextField();
      this.__password1 = new qx.ui.form.TextField();
      this.__password2 = new qx.ui.form.TextField();    
      this.__manager = new qx.ui.form.Manager();
    },
      
    tearDown: function() {
      this.__manager.dispose();
      this.__username.dispose();
      this.__password1.dispose();
      this.__password2.dispose();
    },
    
    
    // validator
    __notEmptyValidator : function(value, formItem) 
    {
      var isString = qx.lang.Type.isString(value);
      var valid = isString && value.length > 0;
      valid ? formItem.setInvalidMessage("") : formItem.setInvalidMessage("fail");
      return valid;
    },   
    
    __notEmptyValidatorError : function(value) 
    {
      var isString = qx.lang.Type.isString(value);
      if (!isString || value.length == 0) {
        throw new qx.core.ValidationError("fail");
      }
    },
    
    __asyncValidator : function(validator, value) {
      window.setTimeout(function() {
        var valid = value != null && value.length > 0;
        validator.setValid(valid, "fail");
      }, 100);
    },
    
    
    
    //  sync self contained ///////////////
    testSyncSelfContained1NotNull: function() {
      this.__manager.add(this.__username, null, this.__notEmptyValidator);
      
      // validate = fail (no text entered)
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__manager.getValid());      
      this.assertFalse(this.__username.getValid());  
      
      // check the invalid messages
      this.assertEquals("fail", this.__username.getInvalidMessage());
      this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);          
      
      // enter text in the usernamen
      this.__username.setValue("affe");
      
      // validate = true
      this.assertTrue(this.__manager.validate());
      this.assertTrue(this.__manager.getValid());      
      this.assertTrue(this.__username.getValid());
      
      // remove the username
      this.__username.resetValue();
      
      // validate = faíl
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__manager.getValid());      
      this.assertFalse(this.__username.getValid());      
    },
    
    
    testSyncSelfContained1NotNullEvents: function(attributes) {
      this.__manager.add(this.__username, null, this.__notEmptyValidator);

      var self = this;
      this.assertEventFired(this.__manager, "changeValid", function() {
        self.__manager.validate();
      }, function(e) {
        self.assertFalse(e.getData());
        self.assertNull(e.getOldData());
      });
      
      // make the form valid
      this.__username.setValue("affe");
      
      this.assertEventFired(this.__manager, "changeValid", function() {
        self.__manager.validate();
      }, function(e) {
        self.assertTrue(e.getData());
        self.assertFalse(e.getOldData());
      });      
    },
    
    
    __testSyncSelfContained3NotNull: function(validator) {
      this.__manager.add(this.__username, null, validator);
      this.__manager.add(this.__password1, null, validator);
      this.__manager.add(this.__password2, null, validator);
      
      // validate = fail (no text entered)
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__username.getValid());
      this.assertFalse(this.__password1.getValid());
      this.assertFalse(this.__password2.getValid());
      
      // check the invalid messages
      this.assertEquals("fail", this.__username.getInvalidMessage());      
      this.assertEquals("fail", this.__password1.getInvalidMessage());
      this.assertEquals("fail", this.__password2.getInvalidMessage());
      this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);
      this.assertEquals("fail", this.__manager.getInvalidMessages()[1]);
      this.assertEquals("fail", this.__manager.getInvalidMessages()[2]);
      this.assertEquals(3, this.__manager.getInvalidMessages().length);      
      
      // enter text to the two passwordfields
      this.__password1.setValue("1");
      this.__password2.setValue("2");
      
      // validate again = fail (username empty)
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__username.getValid());
      this.assertTrue(this.__password1.getValid());
      this.assertTrue(this.__password2.getValid());      
      
      // check the invalid messages
      this.assertEquals("fail", this.__username.getInvalidMessage());      
      this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);
      this.assertEquals(1, this.__manager.getInvalidMessages().length);      
      
      
      // enter text in the usernamen
      this.__username.setValue("affe");
      
      // validate = true
      this.assertTrue(this.__manager.validate());
      this.assertTrue(this.__username.getValid());
      this.assertTrue(this.__password1.getValid());
      this.assertTrue(this.__password2.getValid());    
      this.assertEquals(0, this.__manager.getInvalidMessages().length);
      
      // remove the username
      this.__username.resetValue();
      
      // validate last time = false
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__username.getValid());
      this.assertTrue(this.__password1.getValid());
      this.assertTrue(this.__password2.getValid());    
      this.assertEquals(1, this.__manager.getInvalidMessages().length);      
    },
    
    
    testSyncSelfContained3NotNull : function() {
      this.__testSyncSelfContained3NotNull(this.__notEmptyValidator);
    },
    
    
    testSyncSelfContained3NotNullError : function() {
      this.__testSyncSelfContained3NotNull(this.__notEmptyValidatorError);      
    },
    
    // //////////////////////////////
      
      
    // sync related //////////////
    
    __testSyncRelatedNoIndividual: function(validator) {
      this.__manager.add(this.__username);
      this.__manager.add(this.__password1);
      this.__manager.add(this.__password2);
      
      this.__password1.setValue("affe");
      
      this.__manager.setValidator(validator);
      
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__manager.getValid());

      this.assertEquals("fail", this.__manager.getInvalidMessage());
      this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);

      this.__password2.setValue("affe");
      
      this.assertTrue(this.__manager.validate());
      this.assertTrue(this.__manager.getValid());

      this.assertEquals(0, this.__manager.getInvalidMessages().length);      
    },
    
    
    testSyncRelatedNoIndividual : function() {
      this.__testSyncRelatedNoIndividual(function(formItems, manager) {
        var valid = formItems[1].getValue() == formItems[2].getValue();
        if (!valid) {
          manager.setInvalidMessage("fail");
        }
        return valid;
      });
    },
    
    
    testSyncRelatedNoIndividualError : function() {
      this.__testSyncRelatedNoIndividual(function(formItems, manager) {
        if (formItems[1].getValue() != formItems[2].getValue()) {
          throw new qx.core.ValidationError("fail");
        }
      });
    },
    
    
    testSyncRelatedWithIndividual: function() {
      this.__manager.add(this.__username, null, this.__notEmptyValidator);
      this.__manager.add(this.__password1, null, this.__notEmptyValidator);
      this.__manager.add(this.__password2, null, this.__notEmptyValidator);
      
      this.__password1.setValue("affe");
      
      this.__manager.setValidator(function(formItems, manager) {
        var valid = formItems[1].getValue() == formItems[2].getValue();
        if (!valid) {
          manager.setInvalidMessage("fail");
        }
        return valid;
      });
      
      // false: username and password2 empty && password 1 != password2
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__manager.getValid());
      this.assertFalse(this.__username.getValid());
      this.assertFalse(this.__password2.getValid());

      var messages = this.__manager.getInvalidMessages();
      this.assertEquals("fail", this.__manager.getInvalidMessage());
      this.assertEquals("fail", messages[0]);
      this.assertEquals("fail", messages[1]);
      this.assertEquals("fail", messages[2]);
      this.assertEquals(3, messages.length);


      this.__password2.setValue("affe");

      // fail: username empty
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__manager.getValid());
      this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);
      this.assertEquals(1, this.__manager.getInvalidMessages().length);

      this.__username.setValue("user");
      
      // ok
      this.assertTrue(this.__manager.validate());
      this.assertTrue(this.__manager.getValid());
      this.assertEquals(0, this.__manager.getInvalidMessages().length);
      this.assertTrue(this.__username.getValid());
      this.assertTrue(this.__password1.getValid());
      this.assertTrue(this.__password2.getValid());  
      
      // change back to not valid
      this.__password1.setValue("user");
      
      // not ok
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__manager.getValid());
      this.assertEquals(1, this.__manager.getInvalidMessages().length);
      this.assertTrue(this.__username.getValid());         
    },
    
    // //////////////////////////////


    // reset and required ///////////
    
    testReset: function() {
      // set the initla values
      this.__username.setValue("A");
      this.__password1.setValue("B");
      this.__password2.setValue("C");
      // add the fields to the form manager
      this.__manager.add(this.__username);
      this.__manager.add(this.__password1);
      this.__manager.add(this.__password2);
      // change the values of the fields
      this.__username.setValue("a");
      this.__password1.setValue("b");
      this.__password2.setValue("c");      
      // reset the manager
      this.__manager.reset();
      
      // check if the initial values are reset
      this.assertEquals("A", this.__username.getValue());
      this.assertEquals("B", this.__password1.getValue());
      this.assertEquals("C", this.__password2.getValue());
      // check if the fields are valid
      this.assertTrue(this.__username.isValid());
      this.assertTrue(this.__password1.isValid());
      this.assertTrue(this.__password2.isValid());            
      // check the form
      this.assertNull(this.__manager.isValid());
    },
    
    
    testRequired: function() {
      // set all 3 fields to required
      this.__username.setRequired(true);
      this.__password1.setRequired(true);
      this.__password2.setRequired(true);

      // add the fields to the form manager
      this.__manager.add(this.__username);
      this.__manager.add(this.__password1);
      this.__manager.add(this.__password2);      
      
      // validate = fail (no text entered)
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__username.getValid());
      this.assertFalse(this.__password1.getValid());
      this.assertFalse(this.__password2.getValid());
      
      // enter text to the two passwordfields
      this.__password1.setValue("1");
      this.__password2.setValue("2");
      
      // validate again = fail (username empty)
      this.assertFalse(this.__manager.validate());
      this.assertFalse(this.__username.getValid());
      this.assertTrue(this.__password1.getValid());
      this.assertTrue(this.__password2.getValid());            
      
      // enter text in the usernamen
      this.__username.setValue("affe");
      
      // validate last time = true
      this.assertTrue(this.__manager.validate());
      this.assertTrue(this.__username.getValid());
      this.assertTrue(this.__password1.getValid());
      this.assertTrue(this.__password2.getValid());    
    },

    // //////////////////////////////



    // Async self contained //////////

    testAsyncSelfContained1NotNullFail: function(){
      var asyncValidator = new qx.ui.form.AsyncValidator(this.__asyncValidator);
    
      this.__manager.add(this.__username, null, asyncValidator);
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertFalse(this.__manager.isValid());
          this.assertFalse(this.__username.getValid());
          this.assertEquals("fail", this.__username.getInvalidMessage());
        }, this);
      }, this);
      
      this.__manager.validate();
      
      this.wait();
    },
    
    
    testAsyncSelfContained1NotNull: function(){
      var asyncValidator = new qx.ui.form.AsyncValidator(this.__asyncValidator);
    
      this.__manager.add(this.__username, null, asyncValidator);
      this.__username.setValue("affe");
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertTrue(this.__manager.isValid());
          this.assertTrue(this.__username.getValid());
        }, this);
      }, this);
      
      this.__manager.validate();
      
      this.wait();
    },    
    
    
    testAsyncSelfContained3NotNullFail: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator2 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator3 = new qx.ui.form.AsyncValidator(this.__asyncValidator);    
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, asyncValidator2);
      this.__manager.add(this.__password2, null, asyncValidator3);            
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertFalse(this.__manager.isValid());
          this.assertFalse(this.__username.getValid());
          
          this.assertEquals("fail", this.__username.getInvalidMessage());
          this.assertEquals("fail", this.__password1.getInvalidMessage());
          this.assertEquals("fail", this.__password2.getInvalidMessage());
          
          this.assertEquals(3, this.__manager.getInvalidMessages().length);
          this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);
          this.assertEquals("fail", this.__manager.getInvalidMessages()[1]);
          this.assertEquals("fail", this.__manager.getInvalidMessages()[2]);
        }, this);
      }, this);
      
      this.__manager.validate();
      
      this.wait();
    },
    
    
    testAsyncSelfContained3NotNull: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator2 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator3 = new qx.ui.form.AsyncValidator(this.__asyncValidator);    
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, asyncValidator2);
      this.__manager.add(this.__password2, null, asyncValidator3);            
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertTrue(this.__manager.isValid());
          this.assertTrue(this.__username.getValid());
        }, this);
      }, this);
      
      // add values to all three input fields
      this.__username.setValue("a");
      this.__password1.setValue("b");
      this.__password2.setValue("c");
      
      this.__manager.validate();
      
      this.wait();
    },
    
    
    testAsyncSelfContained3NotNullHalfFail: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator2 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator3 = new qx.ui.form.AsyncValidator(this.__asyncValidator);    
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, asyncValidator2);
      this.__manager.add(this.__password2, null, asyncValidator3);            
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertFalse(this.__manager.isValid());
          this.assertFalse(this.__username.getValid());
          this.assertEquals("fail", this.__username.getInvalidMessage());

          this.assertEquals("fail", this.__manager.getInvalidMessages()[0]);
          this.assertEquals(1, this.__manager.getInvalidMessages().length);
        }, this);
      }, this);
      
      // add values to all three input fields
      this.__password1.setValue("b");
      this.__password2.setValue("c");
      
      this.__manager.validate();
      
      this.wait();
    },
  
    // //////////////////////////////
    
    
    
    // Async related //////////

    testAsyncRelated3NotNullFail: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator2 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator3 = new qx.ui.form.AsyncValidator(this.__asyncValidator);    
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, asyncValidator2);
      this.__manager.add(this.__password2, null, asyncValidator3);            
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertFalse(this.__manager.isValid());
          this.assertTrue(this.__username.getValid());
          this.assertTrue(this.__password1.getValid());
          this.assertTrue(this.__password2.getValid());
        }, this);
      }, this);

      this.__manager.setValidator(new qx.ui.form.AsyncValidator(
        function(formItems, validator) {
          window.setTimeout(function() {
            validator.setValid(formItems[1].getValue() == formItems[2].getValue());
          }, 100);
        }
      ));
      
      this.__username.setValue("u");
      this.__password1.setValue("a");
      this.__password2.setValue("b");
      
      this.__manager.validate();
      
      this.wait();
    },
    
    
    testAsyncRelated3NotNull: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator2 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator3 = new qx.ui.form.AsyncValidator(this.__asyncValidator);    
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, asyncValidator2);
      this.__manager.add(this.__password2, null, asyncValidator3);            
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertTrue(this.__manager.isValid());
          this.assertTrue(this.__username.getValid());
          this.assertTrue(this.__password1.getValid());
          this.assertTrue(this.__password2.getValid());

        }, this);
      }, this);

      this.__manager.setValidator(new qx.ui.form.AsyncValidator(
        function(formItems, validator) {
          window.setTimeout(function() {
            validator.setValid(formItems[1].getValue() == formItems[2].getValue());
          }, 100);
        }
      ));
      
      this.__username.setValue("u");
      this.__password1.setValue("a");
      this.__password2.setValue("a");
      
      this.__manager.validate();
      
      this.wait();
    },
    
    // //////////////////////////////
    
    
    
    // Mixed self contaned //////////    
    testMixedSelfContained3NotNullAsyncFail: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, this.__notEmptyValidator);
      this.__manager.add(this.__password2, null, this.__notEmptyValidator);            
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertFalse(this.__manager.isValid());
          this.assertFalse(this.__username.getValid());
          this.assertTrue(this.__password1.getValid());
          this.assertTrue(this.__password2.getValid());
        }, this);
      }, this);
      
      this.__password1.setValue("a");
      this.__password2.setValue("b");
      
      this.__manager.validate();
      
      this.wait();
    },
  
  
    testMixedSelfContained3NotNullSyncFail: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, this.__notEmptyValidator);
      this.__manager.add(this.__password2, null, this.__notEmptyValidator);
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertFalse(this.__manager.isValid());
          this.assertTrue(this.__username.getValid());
          this.assertFalse(this.__password1.getValid());
          this.assertTrue(this.__password2.getValid());
        }, this);
      }, this);
      
      this.__username.setValue("a");
      this.__password2.setValue("b");
      
      this.__manager.validate();
      
      this.wait();
    },
    
    
    testMixedSelfContained3NotNullSync: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, this.__notEmptyValidator);
      this.__manager.add(this.__password2, null, this.__notEmptyValidator);            
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertTrue(this.__manager.isValid());
          this.assertTrue(this.__username.getValid());
          this.assertTrue(this.__password1.getValid());
          this.assertTrue(this.__password2.getValid());
        }, this);
      }, this);
      
      this.__username.setValue("a");
      this.__password1.setValue("b");
      this.__password2.setValue("c");
      
      this.__manager.validate();
      
      this.wait();
    },
    
    
    testMixedSelfContained2SyncRequired : function(attribute) {
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      
      this.__password1.setRequired(true);
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1);
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertFalse(this.__manager.isValid());
          this.assertTrue(this.__username.getValid());
          this.assertFalse(this.__password1.getValid());
        }, this);
      }, this);
      
      this.__username.setValue("a");
      
      this.__manager.validate();
      
      this.wait();      
    },
    // //////////////////////////////
    
    
    
    // Mixed related //////////    
    testMixedRelated3NotNull: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator3 = new qx.ui.form.AsyncValidator(this.__asyncValidator);    
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, this.__notEmptyValidator);
      this.__manager.add(this.__password2, null, asyncValidator3);            
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertTrue(this.__manager.isValid());
          this.assertTrue(this.__username.getValid());
          this.assertTrue(this.__password1.getValid());
          this.assertTrue(this.__password2.getValid());

        }, this);
      }, this);

      this.__manager.setValidator(new qx.ui.form.AsyncValidator(
        function(formItems, validator) {
          window.setTimeout(function() {
            validator.setValid(formItems[1].getValue() == formItems[2].getValue());
          }, 100);
        }
      ));
      
      this.__username.setValue("u");
      this.__password1.setValue("a");
      this.__password2.setValue("a");
      
      this.__manager.validate();
      
      this.wait();
    },
    
    
    testMixedRelated3NotNullSyncFail: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator3 = new qx.ui.form.AsyncValidator(this.__asyncValidator);    
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, this.__notEmptyValidator);
      this.__manager.add(this.__password2, null, asyncValidator3);            
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertFalse(this.__manager.isValid());
          this.assertTrue(this.__username.getValid());
          this.assertFalse(this.__password1.getValid());
          this.assertTrue(this.__password2.getValid());

        }, this);
      }, this);

      this.__manager.setValidator(new qx.ui.form.AsyncValidator(
        function(formItems, validator) {
          window.setTimeout(function() {
            validator.setValid(formItems[1].getValue() == formItems[2].getValue());
          }, 100);
        }
      ));
      
      this.__username.setValue("u");
      this.__password2.setValue("a");
      
      this.__manager.validate();
      
      this.wait();
    },
    
    testMixedRelated3NotNullAsyncFail: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator3 = new qx.ui.form.AsyncValidator(this.__asyncValidator);    
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, this.__notEmptyValidator);
      this.__manager.add(this.__password2, null, asyncValidator3);            
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertFalse(this.__manager.isValid());
          this.assertFalse(this.__username.getValid());
          this.assertTrue(this.__password1.getValid());
          this.assertTrue(this.__password2.getValid());

        }, this);
      }, this);

      this.__manager.setValidator(new qx.ui.form.AsyncValidator(
        function(formItems, validator) {
          window.setTimeout(function() {
            validator.setValid(formItems[1].getValue() == formItems[2].getValue());
          }, 100);
        }
      ));
      
      this.__password1.setValue("a");
      this.__password2.setValue("a");
      
      this.__manager.validate();
      
      this.wait();
    },
    
    testMixedRelated3NotNullAsyncFormFail: function(){
      var asyncValidator1 = new qx.ui.form.AsyncValidator(this.__asyncValidator);
      var asyncValidator3 = new qx.ui.form.AsyncValidator(this.__asyncValidator);    
      
      this.__manager.add(this.__username, null, asyncValidator1);
      this.__manager.add(this.__password1, null, this.__notEmptyValidator);
      this.__manager.add(this.__password2, null, asyncValidator3);            
      
      this.__manager.addListener("complete", function() {
        this.resume(function() {
          // check the status after the complete
          this.assertFalse(this.__manager.isValid());
          this.assertTrue(this.__username.getValid());
          this.assertTrue(this.__password1.getValid());
          this.assertTrue(this.__password2.getValid());

        }, this);
      }, this);

      this.__manager.setValidator(new qx.ui.form.AsyncValidator(
        function(formItems, validator) {
          window.setTimeout(function() {
            validator.setValid(formItems[1].getValue() == formItems[2].getValue());
          }, 100);
        }
      ));
      
      this.__username.setValue("u");
      this.__password1.setValue("a");
      this.__password2.setValue("b");
      
      this.__manager.validate();
      
      this.wait();
    }    
    
    // //////////////////////////////


  }
});
