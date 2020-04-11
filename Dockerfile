FROM python:3
ADD app.py /
ADD main.py /
ADD server.py /
ADD index.* /
ADD requirements.txt /
RUN pip install -r ./requirements.txt
CMD [ "python", "./main.py" ]
