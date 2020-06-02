source pippin_venv/bin/activate
pip3 install -r pippin_requirements.txt

read_var() {
     VAR=$(grep -w $1 $2 | xargs)
     IFS="=" read -ra VAR <<< "$VAR"
     echo ${VAR[1]}
}
 
DPOW_USER=$(read_var DPOW_USER ../../.env)
DPOW_KEY=$(read_var DPOW_KEY ../../.env)

File=~/PippinData/.env
if grep -q "DPOW_USER" "$File";
then
echo "DPOW user already configured"
else
echo "DPOW_USER=$DPOW_USER" >> ~/PippinData/.env
fi

if grep -q "DPOW_KEY" "$File";
then
echo "DPOW key already configured"
else
echo "DPOW_KEY=$DPOW_KEY" >> ~/PippinData/.env
fi

pippin-server